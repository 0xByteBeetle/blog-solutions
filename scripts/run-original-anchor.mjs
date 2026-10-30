// Optional repository dispatcher; every Anchor article owns its harness/dependencies.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const name=process.argv[2];
const projects=JSON.parse(fs.readFileSync(root+'/catalog/project-paths.json'));
const project=projects['examples/solana/'+name];
if(!project)throw new Error('Unknown project');
const article=project.split('/projects/')[0];
const runner=path.join(root,article,'scripts/run-original-anchor.mjs');
if(!fs.existsSync(runner))throw new Error('This project has no Anchor harness');
const result=spawnSync(process.execPath,[runner,...process.argv.slice(2)],{cwd:path.join(root,article),stdio:'inherit'});
process.exit(result.status|| (result.error?1:0));
