// Fetch pinned build libraries only. Does not execute published network examples.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
function run(cmd,args,cwd=root){const r=spawnSync(cmd,args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']});if(r.status!==0)throw new Error(r.stderr||String(r.error));return r.stdout.trim();}
run('npm',['ci','--ignore-scripts']);
fs.mkdirSync(root+'/.local',{recursive:true});
const library=root+'/.local/forge-std';
if(!fs.existsSync(library))run('git',['clone','--branch','v1.16.1','--depth','1','https://github.com/foundry-rs/forge-std.git',library]);
if(run('git',['rev-parse','HEAD'],library)!=='620536fa5277db4e3fd46772d5cbc1ea0696fb43')throw new Error('Unexpected forge-std revision; existing directory left untouched.');
console.log('Pinned OpenZeppelin 5.6.1 and forge-std v1.16.1 available. These are reproduction dependencies, not a claim about original article dependency versions.');
