// Supplemental disposable-local harness for this article's programs only.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createServer} from 'node:net';
import {requireToolchain} from './check-toolchain.mjs';
const root=path.resolve(import.meta.dirname,'..');
const projects={"anchor-accounts": {"directory": ".", "program": "solana_accounts"}};
const [name,...flags]=process.argv.slice(2);
if(!Object.hasOwn(projects,name))throw new Error('Choose an article project: '+Object.keys(projects).join(', '));
if(!flags.includes('--execute-local'))throw new Error('Refusing execution: --execute-local authorizes disposable local keys and build/test only');
if(flags.some(x=>!['--execute-local','--build-only'].includes(x)))throw new Error('Unknown runner flag');
for(const key of ['ANCHOR_PROVIDER_URL','SOLANA_URL','SOLANA_RPC_URL']){
 if(process.env[key]&&!/^http:\/\/(127\.0\.0\.1|localhost):[0-9]+\/?$/.test(process.env[key]))throw new Error('Non-loopback environment rejected: '+key);
}
if(process.env.ANCHOR_WALLET)throw new Error('Personal/external ANCHOR_WALLET is not accepted');
const buildOnly=flags.includes('--build-only'), selected=projects[name];
const deps=path.join(root,'node_modules');
if(!fs.existsSync(deps))throw new Error('Run npm ci --ignore-scripts in this article first');
requireToolchain(['anchor','cargo','solana-keygen',...(!buildOnly?['solana-test-validator']:[])]);
if(!buildOnly)await new Promise((resolve,reject)=>{const p=createServer();p.once('error',()=>reject(new Error('Local validator port 19899 occupied')));p.listen(19899,'127.0.0.1',()=>p.close(resolve));});
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'blog-'+name+'-'));
const project=path.join(temporary,'project'), wallet=path.join(temporary,'wallet.json');
const execution=[];let status='failed';
function run(command,args){const r=spawnSync(command,args,{cwd:project,encoding:'utf8',maxBuffer:30*1024*1024,env:{...process.env,ANCHOR_PROVIDER_URL:'http://127.0.0.1:19899',ANCHOR_WALLET:wallet,TS_NODE_TRANSPILE_ONLY:'true'}});process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');execution.push({command:[command,...args],exitCode:r.status,stdout:r.stdout,stderr:r.stderr});if(r.status!==0)throw new Error(command+' failed ('+r.status+')');return r;}
try{
 fs.cpSync(path.join(root,selected.directory),project,{recursive:true,filter:p=>!/(^|\/)(target|node_modules|\.anchor|\.local|verification|\.git)(\/|$)/.test(p)});
 fs.copyFileSync(root+'/package.json',project+'/package.json');
 fs.symlinkSync(deps,project+'/node_modules','dir');
 run('solana-keygen',['new','--no-bip39-passphrase','--silent','--outfile',wallet]);
 fs.mkdirSync(project+'/target/deploy',{recursive:true});
 const key=project+'/target/deploy/'+selected.program+'-keypair.json';
 run('solana-keygen',['new','--no-bip39-passphrase','--silent','--outfile',key]);
 const id=run('solana-keygen',['pubkey',key]).stdout.trim();
 const test=deps+'/.bin/ts-mocha -p ./tsconfig.json -t 120000 tests/**/*.ts';
 fs.writeFileSync(project+'/Anchor.toml',`[toolchain]
anchor_version = "0.31.1"
package_manager = "npm"
[features]
resolution = true
skip-lint = false
[programs.localnet]
${selected.program} = "${id}"
[provider]
cluster = "localnet"
wallet = "${wallet}"
[test.validator]
bind_address = "127.0.0.1"
rpc_port = 19899
gossip_port = 19901
faucet_port = 19902
dynamic_port_range = "19903-20000"
[scripts]
test = "${test}"
`);
 run('anchor',['keys','sync']);
 run('anchor',[buildOnly?'build':'test']);
 status=buildOnly?'build-checked':'runtime-verified';
}finally{
 fs.mkdirSync(root+'/verification',{recursive:true});
 fs.writeFileSync(root+'/verification/'+name+'.json',JSON.stringify({date:new Date().toISOString(),project:selected.directory,status,execution,note:'Temporary local IDs/config/wallet only; printed program and tests unchanged. TypeScript transpile-only, not a typecheck.'},null,2)+'\n');
 fs.rmSync(temporary,{recursive:true,force:true});
}
