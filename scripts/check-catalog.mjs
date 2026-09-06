import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const catalog=JSON.parse(fs.readFileSync(`${root}/catalog/articles.json`));
const sources=JSON.parse(fs.readFileSync(`${root}/catalog/source-files.json`));
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
function local(relative){assert.equal(typeof relative,'string');const p=path.resolve(root,relative);assert.ok(p.startsWith(root+path.sep),'Path must stay in repository');return p;}
assert.ok(catalog.length>0);
const urls=new Set(), slugs=new Set();let blocks=0;
for(const article of catalog){
 assert.ok(!urls.has(article.url)&&!slugs.has(`${article.chain}/${article.slug}`));
 urls.add(article.url);slugs.add(`${article.chain}/${article.slug}`);
 const directory=`articles/${article.chain}/${article.slug}`;
 assert.ok(fs.existsSync(local(`${directory}/README.md`)));
 const snapshot=fs.readFileSync(local(`${directory}/published.md`),'utf8');
 const captured=[...snapshot.matchAll(/## Block (\d+)\n\nSHA-256: `([a-f0-9]{64})`\n\n````text\n([\s\S]*?)\n````/g)];
 assert.equal(captured.length,article.displayedBlockCount,article.slug);
 assert.equal(article.sourceBlocks.length,captured.length);
 for(let i=0;i<captured.length;i++){
  const [,index,expected,text]=captured[i], record=article.sourceBlocks[i];
  assert.equal(Number(index),i+1);assert.equal(record.index,i+1);
  assert.equal(hash(text),expected,`${article.slug} block ${index} changed`);
  assert.equal(record.sha256,expected);
  for(const file of record.implementations)assert.ok(sources.some(s=>s.path===file),`Untracked source ${file}`);
  for(const file of record.originalRepositoryFiles||[])assert.ok(sources.some(s=>s.path===file),`Untracked original repository variant ${file}`);
 }
 for(const item of article.coverage)assert.ok(fs.existsSync(local(item.path)),item.path);
 // Recovery is not execution. Completion requires explicit coverage and evidence.
 if(article.verification.status==='verified'){
  assert.ok(article.sourceBlocks.every(b=>b.kind!=='unclassified'&&b.kind!=='needs-review'));
  assert.ok(article.verification.evidence?.length,'Verified articles require explicit evidence');
  for(const p of article.verification.evidence)assert.ok(fs.existsSync(local(p)));
 }
 blocks+=captured.length;
}
const paths=new Set();
for(const source of sources){
 assert.ok(!paths.has(source.path),`Duplicate source ${source.path}`);paths.add(source.path);
 assert.equal(hash(fs.readFileSync(local(source.path))),source.sha256,`Recovered author source drift: ${source.path}`);
 assert.ok(source.source.url||source.source.repository||source.source.localProject);
 if(source.source.url){
  const article=catalog.find(a=>a.url===source.source.url);
  assert.ok(article,`Unknown published source for ${source.path}`);
  const block=article.sourceBlocks.find(b=>b.index===source.source.block);
  assert.ok(block,`Unknown published block for ${source.path}`);
  assert.equal(block.sha256,source.source.sha256,`Published origin hash mismatch for ${source.path}`);
 }
}
console.log(`Source integrity passed: ${catalog.length} articles, ${blocks} published blocks, ${sources.length} restored files. This is not runtime verification.`);
if(process.argv.includes('--complete')){
 const unfinished=catalog.filter(a=>!['verified','no-displayed-code'].includes(a.verification.status));
 assert.equal(unfinished.length,0,`${unfinished.length} articles still need example-level verification`);
}
