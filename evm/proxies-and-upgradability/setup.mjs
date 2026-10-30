// Supplemental dependency setup. Run from this article directory; no blockchain activity.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname);
function run(cmd,args,cwd=root){const r=spawnSync(cmd,args,{cwd,encoding:'utf8',stdio:'pipe'});if(r.status!==0)throw new Error(r.stderr||String(r.error));return r.stdout.trim();}
run('npm',['ci','--ignore-scripts']);
const lib=path.join(root,'.local/forge-std');
fs.mkdirSync(path.dirname(lib),{recursive:true});
if(!fs.existsSync(lib))run('git',['clone','--branch','v1.16.1','--depth','1','https://github.com/foundry-rs/forge-std.git',lib]);
if(run('git',['rev-parse','HEAD'],lib)!=='620536fa5277db4e3fd46772d5cbc1ea0696fb43')throw new Error('Unexpected forge-std revision');
