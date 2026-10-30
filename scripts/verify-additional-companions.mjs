// Durable offline/local gates for supplemental companions; no public RPC or keys.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const results=[];
for(const a of JSON.parse(fs.readFileSync(root+'/catalog/articles.json'))){
 const cwd=path.join(root,a.directory,'additional-examples');if(!fs.existsSync(cwd))continue;
 let command,args;
 if(fs.existsSync(cwd+'/foundry.toml')){command='forge';args=['test'];}
 else if(fs.existsSync(cwd+'/local_rpc.py')){command='python3';args=['local_rpc.py'];}
 else if(fs.existsSync(cwd+'/gap-manifest.json')){command='python3';args=['-m','unittest','discover','-s','tests','-v'];}
 else if(fs.existsSync(cwd+'/companion-manifest.json')){command=process.execPath;args=['--test',...fs.readdirSync(cwd+'/tests').filter(f=>f.endsWith('.test.mjs')).map(f=>'tests/'+f)];}
 else throw new Error('Unregistered supplemental project: '+cwd);
 const r=spawnSync(command,args,{cwd,encoding:'utf8',timeout:300000,maxBuffer:10*1024*1024});
 results.push({article:a.slug,command:[command,...args],exitCode:r.status,output:(r.stdout||'')+(r.stderr||''),error:r.error?String(r.error):undefined});
 console.log(`${a.slug}: ${r.status===0?'PASS':'FAIL'}`);
}
fs.mkdirSync(root+'/verification',{recursive:true});
fs.writeFileSync(root+'/verification/additional-companions.json',JSON.stringify({date:new Date().toISOString(),scope:'Supplemental offline/loopback EVM tests and Solana static checks; no Solana runtime or public-network claim',results},null,2)+'\n');
if(results.some(r=>r.exitCode!==0))process.exitCode=1;
