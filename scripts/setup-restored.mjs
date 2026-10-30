// Install each article's own pinned reproduction dependencies.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
for(const a of JSON.parse(fs.readFileSync(root+'/catalog/articles.json'))){
 const setup=path.join(root,a.directory,'setup.mjs');if(!fs.existsSync(setup))continue;
 const r=spawnSync(process.execPath,[setup],{cwd:path.dirname(setup),stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}
