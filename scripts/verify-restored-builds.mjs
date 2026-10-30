// Build/test orchestration, not replacement example implementations.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {requireToolchain} from './check-toolchain.mjs';
const evmOnly=process.argv.includes('--evm');
if(process.argv.slice(2).some(arg=>arg!=='--evm'))throw new Error('Usage: node scripts/verify-restored-builds.mjs [--evm]');
requireToolchain(evmOnly?['forge', 'go']:['forge', 'go', 'cargo']);
const root=path.resolve(import.meta.dirname,'..');
const projectPaths=JSON.parse(fs.readFileSync(root+'/catalog/project-paths.json'));
const projectPath=(chain,name)=>projectPaths['examples/'+chain+'/'+name];
const sources=JSON.parse(fs.readFileSync(root+'/catalog/source-files.json'));
fs.mkdirSync(root+'/.local/go-cache',{recursive:true});
const checks=[
 ['evm/proxies-and-upgradability-uups-proxy/projects/storage-validation','forge',['test'],'unit-tested'],
 ['evm/evm-message-signtypeddata-eip-712/projects/permit-verifier','forge',['build'],'build-checked'],
 ['evm/evm-tx-setcode-transactions-eip-7702/projects/delegation','forge',['build'],'build-checked'],
 ['evm/what-actually-happens-when-calldata/projects/calldata','forge',['build'],'build-checked'],
 ['evm/ethereum-calldata-and-bytecode-how/projects/bytecode','forge',['build'],'build-checked'],
 ['evm/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf/projects/diamond','forge',['build'],'build-checked'],
 ...['factory','minimal-proxy','storage','transparent-proxy','uups'].map(project=>[projectPath('evm',project),'forge',['build'],'build-checked']),
 ['evm/what-is-recursive-length-prefix-rlp/projects/rlp','go',['test','./...'],'unit-tested'],
 ['evm/evm-message-signtypeddata-eip-712/projects/transaction-types','go',['test','-run','^$','./...'],'build-checked'],
 ['evm/streaming-on-chain-activity-in-real/projects/streaming','go',['build','-o',path.join(root,'evm/streaming-on-chain-activity-in-real/projects/streaming/.local/program'),'.'],'build-checked'],
 ['evm/batching-calls-efficiently-with-multicall/projects/multicall','go',['build','-o',path.join(root,'evm/batching-calls-efficiently-with-multicall/projects/multicall/.local/program'),'.'],'build-checked'],
 ['solana/architecting-high-performance-solana/projects/zero-copy-layout','cargo',['test','--locked','--','--nocapture'],'unit-tested'],
];
const toolchain=Object.fromEntries((evmOnly?['forge','go']:['forge','go','cargo']).map(command=>[command,spawnSync(command,[command==='go'?'version':'--version'],{encoding:'utf8'}).stdout.trim()]));
const results=[];
for(const [project,command,args,status] of checks.filter(([project])=>!evmOnly||project.startsWith('evm/'))){
 fs.mkdirSync(root+'/'+project+'/.local',{recursive:true});
 const result=spawnSync(command,args,{cwd:root+'/'+project,encoding:'utf8',env:{...process.env,GOCACHE:root+'/.local/go-cache'},maxBuffer:10*1024*1024,timeout:600000});
 const sourceHashes=Object.fromEntries(sources.filter(s=>s.path.startsWith(project+'/')).map(s=>[s.path,crypto.createHash('sha256').update(fs.readFileSync(root+'/'+s.path)).digest('hex')]));
 results.push({project,status:result.status===0?status:'failed',command:command+' '+args.join(' '),sourceHashes,output:(result.stdout||'')+(result.stderr||''),error:result.error?String(result.error):undefined});
 console.log(project+': '+results.at(-1).status);
}
fs.mkdirSync(root+'/verification',{recursive:true});
fs.writeFileSync(root+'/verification/'+(evmOnly?'restored-evm-builds.json':'restored-builds.json'),JSON.stringify({date:new Date().toISOString(),toolchain,note:'Build checks do not execute transaction scripts or validate network behavior.',results},null,2)+'\n');
if(results.some(r=>r.status==='failed'))process.exitCode=1;
