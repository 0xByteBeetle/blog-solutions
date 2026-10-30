import {checks} from './checks.mjs';
// Run reviewed article-local dependency restoration; never execute chain entrypoints.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
function run(cmd,args,cwd){const r=spawnSync(cmd,args,{cwd,stdio:'inherit'});if(r.status!==0)throw new Error(`${cmd} failed in ${cwd}`);}
for(const chain of ['evm','solana','hyperliquid','sui']) {
 for(const entry of fs.readdirSync(path.join(root,chain),{withFileTypes:true})) {
  if(!entry.isDirectory())continue;
  const dir=path.join(root,chain,entry.name);
  if(fs.existsSync(dir+'/setup.mjs'))run(process.execPath,[dir+'/setup.mjs'],dir);
 }
}
for(const check of checks){
 const dir=path.join(root,check.cwd);
 if(check.command[0]==='npm'&&fs.existsSync(dir+'/package-lock.json'))run('npm',['ci','--ignore-scripts'],dir);
 if(check.command[0]==='python3'&&fs.existsSync(dir+'/requirements-verified.txt')){
  if(!fs.existsSync(dir+'/.venv/bin/python'))run('python3',['-m','venv','.venv'],dir);
  run(dir+'/.venv/bin/python',['-m','pip','install','-r','requirements-verified.txt'],dir);
  run(dir+'/.venv/bin/python',['-m','pip','check'],dir);
 }
}
