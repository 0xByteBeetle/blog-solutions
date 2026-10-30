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
const sources=JSON.parse(fs.readFileSync(root+'/catalog/source-files.json'));
fs.mkdirSync(root+'/.local/go-cache',{recursive:true});
const checks=[
 ['examples/evm/storage-validation','forge',['test'],'unit-tested'],
 ['examples/evm/permit-verifier','forge',['build'],'build-checked'],
 ['examples/evm/delegation','forge',['build'],'build-checked'],
 ['examples/evm/calldata','forge',['build'],'build-checked'],
 ['examples/evm/bytecode','forge',['build'],'build-checked'],
 ['examples/evm/diamond','forge',['build'],'build-checked'],
 ...['factory','minimal-proxy','storage','transparent-proxy','uups'].map(project=>['examples/evm/'+project,'forge',['build'],'build-checked']),
 ['examples/evm/rlp','go',['test','./...'],'unit-tested'],
 ['examples/evm/transaction-types','go',['test','-run','^$','./...'],'build-checked'],
 ['examples/evm/streaming','go',['build','-o',path.join(root,'examples/evm/streaming/.local/program'),'.'],'build-checked'],
 ['examples/evm/multicall','go',['build','-o',path.join(root,'examples/evm/multicall/.local/program'),'.'],'build-checked'],
 ['examples/solana/zero-copy-layout','cargo',['test','--locked','--','--nocapture'],'unit-tested'],
];
const toolchain=Object.fromEntries((evmOnly?['forge','go']:['forge','go','cargo']).map(command=>[command,spawnSync(command,[command==='go'?'version':'--version'],{encoding:'utf8'}).stdout.trim()]));
const results=[];
for(const [project,command,args,status] of checks.filter(([project])=>!evmOnly||project.startsWith('examples/evm/'))){
 fs.mkdirSync(root+'/'+project+'/.local',{recursive:true});
 const result=spawnSync(command,args,{cwd:root+'/'+project,encoding:'utf8',env:{...process.env,GOCACHE:root+'/.local/go-cache'},maxBuffer:10*1024*1024,timeout:600000});
 const sourceHashes=Object.fromEntries(sources.filter(s=>s.path.startsWith(project+'/')).map(s=>[s.path,crypto.createHash('sha256').update(fs.readFileSync(root+'/'+s.path)).digest('hex')]));
 results.push({project,status:result.status===0?status:'failed',command:command+' '+args.join(' '),sourceHashes,output:(result.stdout||'')+(result.stderr||''),error:result.error?String(result.error):undefined});
 console.log(project+': '+results.at(-1).status);
}
fs.mkdirSync(root+'/verification',{recursive:true});
fs.writeFileSync(root+'/verification/'+(evmOnly?'restored-evm-builds.json':'restored-builds.json'),JSON.stringify({date:new Date().toISOString(),toolchain,note:'Build checks do not execute transaction scripts or validate network behavior.',results},null,2)+'\n');
if(results.some(r=>r.status==='failed'))process.exitCode=1;
