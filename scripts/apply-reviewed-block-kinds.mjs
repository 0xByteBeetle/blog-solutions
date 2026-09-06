// Apply explicit human-reviewed classifications; never infer completion from a block's type.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const articles=JSON.parse(fs.readFileSync(root+'/catalog/articles.json'));
const reviewed=JSON.parse(fs.readFileSync(root+'/catalog/reviewed-block-kinds.json'));
for(const [slug,kinds] of Object.entries(reviewed)){
 const a=articles.find(a=>a.slug===slug);assert.ok(a,slug);
 assert.equal(a.sourceBlocks.length,kinds.length,slug);
 a.sourceBlocks.forEach((b,i)=>{b.kind=kinds[i];});
}
fs.writeFileSync(root+'/catalog/articles.json',JSON.stringify(articles,null,2)+'\n');
console.log('Unclassified blocks remaining:',articles.flatMap(a=>a.sourceBlocks).filter(b=>b.kind==='unclassified').length);
