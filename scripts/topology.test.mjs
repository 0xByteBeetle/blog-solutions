import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {auditTopology} from './check-topology.mjs';
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'article-topology-'));
 const articles=Array.from({length:58},(_,i)=>({chain:'evm',slug:'article-'+i,directory:'evm/article-'+i,coverage:[],sourceBlocks:[]}));
 fs.mkdirSync(root+'/catalog');
 for(const a of articles){fs.mkdirSync(root+'/'+a.directory,{recursive:true});for(const f of ['README.md','SETUP.md','published.md'])fs.writeFileSync(root+'/'+a.directory+'/'+f,'fixture');fs.writeFileSync(root+'/'+a.directory+'/reproduction.json',JSON.stringify({requiredFiles:[]}));}
 const save=()=>fs.writeFileSync(root+'/catalog/articles.json',JSON.stringify(articles));save();fs.writeFileSync(root+'/catalog/source-files.json','[]');
 return {root,articles,save,close:()=>fs.rmSync(root,{recursive:true,force:true})};
}
test('current 58 published article trees meet topology contract',()=>{assert.match(auditTopology(path.resolve(import.meta.dirname,'..')),/58 self-contained/);});
test('conceptual articles need source/setup docs but no invented runnable project',()=>{const f=fixture();try{assert.doesNotThrow(()=>auditTopology(f.root));}finally{f.close();}});
test('cross-article source dependencies fail topology',()=>{const f=fixture();try{f.articles[0].coverage.push({path:f.articles[1].directory+'/published.md'});f.save();assert.throws(()=>auditTopology(f.root),/depends on another article/);}finally{f.close();}});
test('missing article-local setup fails topology',()=>{const f=fixture();try{fs.unlinkSync(f.root+'/'+f.articles[0].directory+'/SETUP.md');assert.throws(()=>auditTopology(f.root),/SETUP.md/);}finally{f.close();}});
test('escaping Foundry dependency fails topology',()=>{const f=fixture();try{const d=f.root+'/'+f.articles[0].directory+'/project';fs.mkdirSync(d);fs.writeFileSync(d+'/foundry.toml','remappings = ["x/=../../../other/"]');assert.throws(()=>auditTopology(f.root),/escapes article/);}finally{f.close();}});
test('reintroduced split source root fails topology',()=>{const f=fixture();try{fs.mkdirSync(f.root+'/examples');assert.throws(()=>auditTopology(f.root),/Old split/);}finally{f.close();}});
test('lexical article prefix cannot hide parent traversal',()=>{const f=fixture();try{f.articles[0].coverage.push({path:f.articles[0].directory+'/../../catalog/articles.json'});f.save();assert.throws(()=>auditTopology(f.root),/depends on another article/);}finally{f.close();}});

test('deleted dependency manifest fails reproduction contract',()=>{const f=fixture();try{fs.writeFileSync(f.root+'/'+f.articles[0].directory+'/reproduction.json',JSON.stringify({requiredFiles:['project/Cargo.toml']}));assert.throws(()=>auditTopology(f.root),/Missing required manifest/);}finally{f.close();}});
