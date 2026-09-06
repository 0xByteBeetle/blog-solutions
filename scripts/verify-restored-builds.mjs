// Build/test orchestration, not replacement example implementations.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
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
 ['examples/evm/rlp','go',['test','./...'],'unit-tested'],
 ['examples/evm/transaction-types','go',['test','-run','^$','./...'],'build-checked'],
 ['examples/evm/streaming','go',['build','-o',path.join(root,'examples/evm/streaming/.local/program'),'.'],'build-checked'],
 ['examples/evm/multicall','go',['build','-o',path.join(root,'examples/evm/multicall/.local/program'),'.'],'build-checked'],
 ['examples/solana/zero-copy-layout','cargo',['test','--locked','--','--nocapture'],'unit-tested'],
];
const results=[];
for(const [project,command,args,status] of checks){
 fs.mkdirSync(root+'/'+project+'/.local',{recursive:true});
 const result=spawnSync(command,args,{cwd:root+'/'+project,encoding:'utf8',env:{...process.env,GOCACHE:root+'/.local/go-cache'},maxBuffer:10*1024*1024,timeout:600000});
 const sourceHashes=Object.fromEntries(sources.filter(s=>s.path.startsWith(project+'/')).map(s=>[s.path,crypto.createHash('sha256').update(fs.readFileSync(root+'/'+s.path)).digest('hex')]));
 results.push({project,status:result.status===0?status:'failed',command:command+' '+args.join(' '),sourceHashes,output:(result.stdout||'')+(result.stderr||''),error:result.error?String(result.error):undefined});
 console.log(project+': '+results.at(-1).status);
}
fs.mkdirSync(root+'/verification',{recursive:true});
fs.writeFileSync(root+'/verification/restored-builds.json',JSON.stringify({date:new Date().toISOString(),note:'Build checks do not execute transaction scripts or validate network behavior.',results},null,2)+'\n');
if(results.some(r=>r.status==='failed'))process.exitCode=1;
