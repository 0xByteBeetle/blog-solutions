// Structural guarantees only; this does not claim semantic or runtime completeness.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
export function auditTopology(root){
const articles=JSON.parse(fs.readFileSync(root+'/catalog/articles.json'));
assert.equal(articles.length,58,'Published topology inventory must contain 58 reviewed articles (update this gate when the catalog intentionally grows)');
const sources=JSON.parse(fs.readFileSync(root+'/catalog/source-files.json'));
for(const a of articles){
 const directory=`${a.chain}/${a.slug}`;
 assert.equal(a.directory,directory);
 assert.ok(!a.slug.includes('/')&&!a.slug.includes('..')&&!a.chain.includes('/'),'Invalid chain/article directory');
 for(const file of ['README.md','SETUP.md','published.md','reproduction.json'])assert.ok(fs.existsSync(path.join(root,directory,file)),`${directory}/${file}`);
 const requirements=JSON.parse(fs.readFileSync(path.join(root,directory,'reproduction.json')));
 for(const rel of requirements.requiredFiles){const full=path.resolve(root,directory,rel);assert.ok(full.startsWith(path.resolve(root,directory)+path.sep),'Requirement escapes article');assert.ok(fs.existsSync(full),`Missing required manifest/setup: ${directory}/${rel}`);}
 for(const p of [...a.coverage.map(c=>c.path),...(a.relatedLabs||[]).map(c=>c.path),...(a.corrections||[]).map(c=>c.path),...a.sourceBlocks.flatMap(b=>[...b.implementations,...(b.originalRepositoryFiles||[])])]){
  assert.ok(path.resolve(root,p).startsWith(path.resolve(root,directory)+path.sep)&&p.startsWith(directory+'/'),`${directory} depends on another article: ${p}`);
  assert.ok(fs.existsSync(path.join(root,p)),p);
 }
 const walk=d=>{for(const entry of fs.readdirSync(d,{withFileTypes:true})){
  if(['node_modules','.local','target','out','cache','.venv'].includes(entry.name))continue;
  const p=path.join(d,entry.name);assert.ok(!entry.isSymbolicLink(),`Source symlink: ${p}`);
  if(entry.isDirectory())walk(p);
  else if(entry.name==='foundry.toml'){
   const text=fs.readFileSync(p,'utf8');
   for(const match of text.matchAll(/"(?:[^"=]+\/=)?(\.\.[^"\n]+)"/g)){
    const resolved=path.resolve(path.dirname(p),match[1]);assert.ok(resolved.startsWith(path.join(root,directory)+path.sep),`Foundry dependency escapes article: ${p}: ${match[1]}`);
   }
  }
 }};walk(path.join(root,directory));
}
for(const s of sources)assert.ok(articles.some(a=>s.path.startsWith(a.directory+'/')),`Source outside article: ${s.path}`);
assert.ok(!fs.existsSync(root+'/articles')&&!fs.existsSync(root+'/examples'),'Old split source trees must not remain');
return `Topology passed: ${articles.length} self-contained article source trees; required mapped files stay inside each article. Runtime dependencies still require local setup.`;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(auditTopology(path.resolve(import.meta.dirname,'..')));
