// Environment harness: copy original project, use fresh local keys and validator.
// No committed author source or user wallet is changed.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const name=process.argv[2];
if(!['borsh-profile','borsh-proposal','zero-copy','zero-copy-original','anchor-accounts','wallet-token-balances-original','transfer-hook-original'].includes(name))throw new Error('Unknown original project');
const buildOnly=process.argv.includes('--build-only');
const regression=process.argv.includes('--regression');
const preparedAlt=process.argv.includes('--prepared-alt');
if(preparedAlt&&(!regression||name!=='wallet-token-balances-original'))throw new Error('--prepared-alt requires the wallet regression');
if(buildOnly&&regression)throw new Error('Choose build-only or regression, not both');
if(regression&&!['wallet-token-balances-original','transfer-hook-original'].includes(name))throw new Error('No separate regression suite configured for this project');
if(name==='wallet-token-balances-original'&&!buildOnly&&!regression)throw new Error('Original scaffold test is stale. Use --build-only or --regression.');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),`blog-${name}-`));
const project=`${dir}/project`;
const deps=`${root}/solana/anchor/node_modules`;
if(!fs.existsSync(deps))throw new Error('Run npm ci --prefix solana/anchor first');
fs.cpSync(`${root}/examples/solana/${name}`,project,{recursive:true,filter:p=>!/(^|\/)(target|node_modules|\.anchor)(\/|$)/.test(p)});
fs.symlinkSync(deps,`${project}/node_modules`,'dir');
if(regression&&name==='wallet-token-balances-original'){
 fs.mkdirSync(project+'/regression',{recursive:true});
 fs.copyFileSync(root+'/scripts/regressions/wallet-balances.cjs',project+'/regression/wallet-balances.cjs');
 const original=fs.readFileSync(project+'/scripts/client.ts','utf8');
 const marker='main().catch((err) => {';
 if(original.split(marker).length!==2)throw new Error('Client entrypoint changed; review before adapting');
 // Keep every client function unchanged. Suppress its hardcoded demo entrypoint only in this temporary test copy.
 fs.writeFileSync(project+'/scripts/client-for-regression.ts',original.replace(marker,'if (process.env.BLOG_RUN_DEMO === "1") '+marker));
 const creator=fs.readFileSync(project+'/scripts/create_alts.ts','utf8');
 if(creator.split('getSlot("confirmed")').length!==2)throw new Error('ALT creator changed; review before adapting');
 fs.writeFileSync(project+'/scripts/create-alts-for-regression.ts',creator.replace('getSlot("confirmed")','getSlot("finalized")'));
}
if(regression&&name==='transfer-hook-original'){
 fs.mkdirSync(project+'/regression',{recursive:true});
 fs.copyFileSync(root+'/scripts/regressions/transfer-hook.ts',project+'/regression/transfer-hook.ts');
}
const wallet=`${dir}/wallet.json`;
const execution=[];
function run(cmd,args,options={}){const r=spawnSync(cmd,args,{cwd:project,encoding:'utf8',env:{...process.env,TS_NODE_TRANSPILE_ONLY:'true',BLOG_PREPARED_ALT:preparedAlt?'1':'0'},maxBuffer:30*1024*1024,...options});if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);if(cmd==='anchor')execution.push({command:[cmd,...args].join(' '),exitCode:r.status,stdout:r.stdout,stderr:r.stderr});if(r.status!==0)throw new Error(`${cmd} failed (${r.status})`);return r;}
const program=name==='transfer-hook-original'?'transfer_hook_project':name==='wallet-token-balances-original'?'wallet_tokens_balance':name==='anchor-accounts'?'solana_accounts':name==='zero-copy'?'zero_copy_deep_dive':'borsh_deep_dive';
const sourceHashes=Object.fromEntries(JSON.parse(fs.readFileSync(root+'/catalog/source-files.json')).filter(s=>s.path.startsWith('examples/solana/'+name+'/')).map(s=>[s.path,crypto.createHash('sha256').update(fs.readFileSync(root+'/'+s.path)).digest('hex')]));
let result='failed';
const testCommand=regression?(name==='transfer-hook-original'?`${deps}/.bin/ts-mocha -p ./tsconfig.json -t 120000 regression/*.ts`:`${deps}/.bin/mocha -t 120000 regression/*.cjs`):`${deps}/.bin/ts-mocha -p ./tsconfig.json -t 120000 tests/**/*.ts`;
const changes=regression
 ? name==='transfer-hook-original'
   ? 'Original program and original test preserved. A separate regression replaces the catch-all negative assertion with assert.rejects matching the hook error, then asserts unchanged rejected-transfer balances and exact successful-transfer balances. Temporary local program ID/provider/wallet only.'
   : 'Original program and client functions preserved. A temporary client copy guards its automatic historical demo entrypoint. A temporary ALT creator changes recentSlot commitment from confirmed to finalized after a reproduced startup failure. Separate tests wait for a rooted startup slot, create local mints and balances, and supply the actual created ALT. No personal wallets or historical addresses used.'
 : buildOnly
   ? 'Only temporary program IDs and provider/ports/wallet changed. Original program and two client scripts build/type-checked; stale scaffold test not executed.'
   : 'Only temporary program IDs, provider/ports/wallet, and test launcher changed; original instructions, account layout, and test body preserved. TypeScript tests run transpile-only, not a type-check claim.';
try{
 run('solana-keygen',['new','--no-bip39-passphrase','--silent','--outfile',wallet]);
 fs.mkdirSync(`${project}/target/deploy`,{recursive:true});
 const key=`${project}/target/deploy/${program}-keypair.json`;
 run('solana-keygen',['new','--no-bip39-passphrase','--silent','--outfile',key]);
 const id=spawnSync('solana-keygen',['pubkey',key],{encoding:'utf8'}).stdout.trim();
 fs.writeFileSync(`${project}/Anchor.toml`,`[toolchain]\nanchor_version = "0.31.1"\npackage_manager = "npm"\n[features]\nresolution = true\nskip-lint = false\n[programs.localnet]\n${program} = "${id}"\n[provider]\ncluster = "localnet"\nwallet = "${wallet}"\n[test.validator]\nbind_address = "127.0.0.1"\nrpc_port = 19899\ngossip_port = 19901\nfaucet_port = 19902\ndynamic_port_range = "19903-20000"\n[scripts]\ntest = "${testCommand}"\n`);
 run('anchor',['keys','sync']);
 if(regression&&name==='wallet-token-balances-original'){
  run('anchor',['build']);
  // Anchor 0.31.1 stream_logs reads the crate-named IDL, but this original
  // project emits its IDL under the differently spelled Rust module name.
  // Alias only the generated artifact in the disposable copy, not author code.
  fs.copyFileSync(project+'/target/idl/wallet_token_balances.json',project+'/target/idl/wallet_tokens_balance.json');
  run('anchor',['test','--skip-build']);
 }else run('anchor',[buildOnly?'build':'test']);
 if(buildOnly)run(deps+'/.bin/tsc',['--noEmit','--skipLibCheck','--esModuleInterop','--target','es2020','--module','commonjs','scripts/client.ts','scripts/create_alts.ts']);
 result=buildOnly?'build-checked':'runtime-verified';
}finally{
 fs.mkdirSync(`${root}/verification`,{recursive:true});
 const evidenceName=`${name}${regression?'-regression':''}${preparedAlt?'-prepared-alt':''}`;
 const harnessFiles=['scripts/run-original-anchor.mjs',...(regression?[`scripts/regressions/${name==='transfer-hook-original'?'transfer-hook.ts':'wallet-balances.cjs'}`]:[])];
 const harnessHashes=Object.fromEntries(harnessFiles.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(root+'/'+p)).digest('hex')]));
 fs.writeFileSync(`${root}/verification/${evidenceName}.json`,JSON.stringify({date:new Date().toISOString(),project:`examples/solana/${name}`,status:result,sourceHashes,harnessHashes,command:`node scripts/run-original-anchor.mjs ${name}${buildOnly?' --build-only':regression?' --regression':''}${preparedAlt?' --prepared-alt':''}`,changes:changes+(regression&&name==='wallet-token-balances-original'?' Generated IDL is copied under the crate-name alias in the temporary build directory for Anchor log streaming.':'')+(preparedAlt?' Fixture pre-extends the ALT and finalizes it before calling the unchanged client; this verifies existing-ALT use, not cold extension.':''),execution,anchorVersion:spawnSync('anchor',['--version'],{encoding:'utf8'}).stdout.trim()},null,2)+'\n');
 fs.rmSync(dir,{recursive:true,force:true});
}
