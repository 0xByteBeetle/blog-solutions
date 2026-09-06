import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
function fixture(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'blog-source-integrity-'));
 const catalog=JSON.parse(fs.readFileSync(root+'/catalog/articles.json'));
 const sources=JSON.parse(fs.readFileSync(root+'/catalog/source-files.json'));
 const files=['catalog/articles.json','catalog/source-files.json','scripts/check-catalog.mjs',...sources.map(s=>s.path),...catalog.flatMap(a=>['articles/'+a.chain+'/'+a.slug+'/README.md','articles/'+a.chain+'/'+a.slug+'/published.md'])];
 for(const p of files){fs.mkdirSync(path.dirname(dir+'/'+p),{recursive:true});fs.copyFileSync(root+'/'+p,dir+'/'+p);}
 for(const a of catalog)for(const c of a.coverage)if(!fs.existsSync(dir+'/'+c.path))fs.mkdirSync(dir+'/'+c.path,{recursive:true});
 return {dir,catalog,sources,check:(...args)=>spawnSync(process.execPath,[dir+'/scripts/check-catalog.mjs',...args],{encoding:'utf8'})};
}
test('source integrity passes without claiming article completion',()=>{const f=fixture();try{assert.equal(f.check().status,0);assert.notEqual(f.check('--complete').status,0);}finally{fs.rmSync(f.dir,{recursive:true,force:true});}});
test('changing an original implementation fails source integrity',()=>{const f=fixture();try{fs.appendFileSync(f.dir+'/'+f.sources[0].path,'\n// unreviewed change\n');assert.notEqual(f.check().status,0);}finally{fs.rmSync(f.dir,{recursive:true,force:true});}});
test('changing a published example fails source integrity',()=>{const f=fixture();try{const a=f.catalog.find(a=>a.sourceBlocks.length);const p=f.dir+'/articles/'+a.chain+'/'+a.slug+'/published.md';fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('````text\n','````text\nchanged\n'));assert.notEqual(f.check().status,0);}finally{fs.rmSync(f.dir,{recursive:true,force:true});}});
