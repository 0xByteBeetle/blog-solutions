// Environment harness: copy original project, use fresh local keys and validator.
// No committed author source or user wallet is changed.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const name=process.argv[2];
if(!['borsh-profile','borsh-proposal','zero-copy','zero-copy-original','anchor-accounts','wallet-token-balances-original'].includes(name))throw new Error('Unknown original project');
const buildOnly=process.argv.includes('--build-only');
if(name==='wallet-token-balances-original'&&!buildOnly)throw new Error('Original scaffold test calls a nonexistent initialize instruction. Use --build-only; runtime reproduction requires explicit fixture setup.');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),`blog-${name}-`));
const project=`${dir}/project`;
const deps=`${root}/solana/anchor/node_modules`;
if(!fs.existsSync(deps))throw new Error('Run npm ci --prefix solana/anchor first');
fs.cpSync(`${root}/examples/solana/${name}`,project,{recursive:true,filter:p=>!/(^|\/)(target|node_modules|\.anchor)(\/|$)/.test(p)});
fs.symlinkSync(deps,`${project}/node_modules`,'dir');
const wallet=`${dir}/wallet.json`;
function run(cmd,args,options={}){const r=spawnSync(cmd,args,{cwd:project,encoding:'utf8',env:{...process.env,TS_NODE_TRANSPILE_ONLY:'true'},maxBuffer:30*1024*1024,...options});if(r.stdout)process.stdout.write(r.stdout);if(r.stderr)process.stderr.write(r.stderr);if(r.status!==0)throw new Error(`${cmd} failed (${r.status})`);return r;}
const program=name==='wallet-token-balances-original'?'wallet_tokens_balance':name==='anchor-accounts'?'solana_accounts':name==='zero-copy'?'zero_copy_deep_dive':'borsh_deep_dive';
const sourceHashes=Object.fromEntries(JSON.parse(fs.readFileSync(root+'/catalog/source-files.json')).filter(s=>s.path.startsWith('examples/solana/'+name+'/')).map(s=>[s.path,crypto.createHash('sha256').update(fs.readFileSync(root+'/'+s.path)).digest('hex')]));
let result='failed';
try{
 run('solana-keygen',['new','--no-bip39-passphrase','--silent','--outfile',wallet]);
 fs.mkdirSync(`${project}/target/deploy`,{recursive:true});
 const key=`${project}/target/deploy/${program}-keypair.json`;
 run('solana-keygen',['new','--no-bip39-passphrase','--silent','--outfile',key]);
 const id=spawnSync('solana-keygen',['pubkey',key],{encoding:'utf8'}).stdout.trim();
 fs.writeFileSync(`${project}/Anchor.toml`,`[toolchain]\nanchor_version = "0.31.1"\npackage_manager = "npm"\n[features]\nresolution = true\nskip-lint = false\n[programs.localnet]\n${program} = "${id}"\n[provider]\ncluster = "localnet"\nwallet = "${wallet}"\n[test.validator]\nbind_address = "127.0.0.1"\nrpc_port = 19899\ngossip_port = 19901\nfaucet_port = 19902\ndynamic_port_range = "19903-20000"\n[scripts]\ntest = "${deps}/.bin/ts-mocha -p ./tsconfig.json -t 120000 tests/**/*.ts"\n`);
 run('anchor',['keys','sync']);
 run('anchor',[buildOnly?'build':'test']);
 if(buildOnly)run(deps+'/.bin/tsc',['--noEmit','--skipLibCheck','--esModuleInterop','--target','es2020','--module','commonjs','scripts/client.ts','scripts/create_alts.ts']);
 result=buildOnly?'build-checked':'runtime-verified';
}finally{
 fs.mkdirSync(`${root}/verification`,{recursive:true});
 fs.writeFileSync(`${root}/verification/${name}.json`,JSON.stringify({date:new Date().toISOString(),project:`examples/solana/${name}`,status:result,sourceHashes,command:`node scripts/run-original-anchor.mjs ${name}${buildOnly?' --build-only':''}`,changes:buildOnly?'Only temporary program IDs and provider/ports/wallet changed. Original program and two client scripts are build/type-checked; the stale scaffold test is not executed.':'Only temporary program IDs, provider/ports/wallet, and test launcher changed; original instructions, account layout, and test body preserved. TypeScript tests run transpile-only, not a type-check claim.',anchorVersion:spawnSync('anchor',['--version'],{encoding:'utf8'}).stdout.trim()},null,2)+'\n');
 fs.rmSync(dir,{recursive:true,force:true});
}
