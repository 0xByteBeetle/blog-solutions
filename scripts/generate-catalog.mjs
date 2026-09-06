// Render explicit source mappings. Tests of related labs do not verify an article.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const articles=JSON.parse(fs.readFileSync(root+'/catalog/articles.json'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(root+'/'+p)).digest('hex');
const checks=[];
if(fs.existsSync(root+'/verification'))for(const file of fs.readdirSync(root+'/verification').filter(f=>f.endsWith('.json'))){
 const report=JSON.parse(fs.readFileSync(root+'/verification/'+file));
 for(const check of report.results||[report]){
  const hashes=Object.entries(check.sourceHashes||{});
  const current=hashes.length>0&&hashes.every(([p,h])=>fs.existsSync(root+'/'+p)&&hash(p)===h);
  checks.push({...check,current,file:'verification/'+file,date:report.date});
 }
}
for(const article of articles){
 const directory=root+'/articles/'+article.chain+'/'+article.slug;
 const link=(p,label)=>'['+label+']('+path.relative(directory,root+'/'+p)+')';
 const projectPaths=article.coverage.filter(c=>!c.path.endsWith('/published.md'));
 const links=projectPaths.map(c=>'- '+link(c.path,c.path)+(c.command?'\n\n  Run: `'+c.command+'`':'')).join('\n');
 const relevant=checks.filter(c=>projectPaths.some(p=>p.path===c.project));
 const results=relevant.map(c=>'- '+link(c.file,c.project+': '+(c.current?c.status:'stale result, rerun required'))+' ('+c.date.slice(0,10)+')').join('\n');
 const blocks=article.sourceBlocks.map(b=>{
  const primary=b.implementations.map(p=>link(p,'published source')).join(', ')||'Preserved in the published block; runnable mapping pending';
  const originals=(b.originalRepositoryFiles||[]).map(p=>link(p,'original repo variant')).join(', ');
  return '| ['+b.index+'](published.md#block-'+b.index+') | '+b.kind+' | '+primary+(originals?'; '+originals:'')+' |';
 }).join('\n');
 const sections=[
  '# '+article.title,
  '[Read the article]('+article.url+') · [Published examples](published.md)',
  article.verification.note,
  'Article status: **'+article.verification.status+'**.',
  ...(links?['## Recovered source',links]:[]),
  ...(results?['## Recorded checks',results,'These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.']:[]),
  '## Example map',
  blocks?'| Block | Type | Source |\n| --- | --- | --- |\n'+blocks:'No displayed code blocks in the captured post.',
  '“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.',
  ...(article.relatedLabs?.length?['## Supplementary labs','These older topic-level labs are not substitutes for the published code.',article.relatedLabs.map(c=>'- '+link(c.path,c.path)).join('\n')]:[]),
 ];
 fs.writeFileSync(directory+'/README.md',sections.join('\n\n')+'\n');
}
fs.writeFileSync(root+'/ARTICLES.md','# Article examples\n\nSource preservation, build checks, and runtime tests are separate. An article is not marked complete merely because a related lab passes.\n\n'+[...new Set(articles.map(a=>a.chain))].sort().map(chain=>'## '+(chain==='evm'?'EVM':chain==='solana'?'Solana':chain)+'\n\n'+articles.filter(a=>a.chain===chain).map(a=>'- ['+a.title+'](articles/'+a.chain+'/'+a.slug+'/README.md) · '+a.verification.status).join('\n')).join('\n\n')+'\n');
console.log('Rendered '+articles.length+' explicit article maps with current-source check results.');
