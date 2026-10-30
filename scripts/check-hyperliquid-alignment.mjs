// Literal substring checks only: supplemental imports/wrappers may surround a block.
// This does not infer protocol correctness, output freshness, or execution coverage.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export function auditHyperliquid(root, read = fs.readFileSync) {
  const articles = JSON.parse(read(path.join(root, 'catalog/articles.json'), 'utf8')).filter(a => a.chain === 'hyperliquid');
  const mappings = [];
  for (const article of articles) {
    const snapshot = read(path.join(root, `${article.directory||`articles/hyperliquid/${article.slug}`}/published.md`), 'utf8');
    const blocks = new Map([...snapshot.matchAll(/## Block (\d+)\n\nSHA-256: `[a-f0-9]{64}`\n\n````text\n([\s\S]*?)\n````/g)].map(m => [+m[1], m[2]]));
    for (const block of article.sourceBlocks) for (const relative of block.implementations) {
      const filename = path.resolve(root, relative);
      if (!filename.startsWith(path.resolve(root) + path.sep)) throw new Error('Source path escapes repository');
      const text = blocks.get(block.index);
      if (text === undefined || text.length === 0) throw new Error('Missing or empty published block');
      mappings.push({slug: article.slug, block: block.index, path: relative, exact: read(filename, 'utf8').includes(text)});
    }
  }
  return {articles: articles.length, blocks: articles.reduce((n, a) => n + a.displayedBlockCount, 0), mappings};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = auditHyperliquid(path.resolve(import.meta.dirname, '..'));
  const failures = result.mappings.filter(x => !x.exact);
  console.log(`Hyperliquid: ${result.articles} articles, ${result.blocks} blocks, ${result.mappings.length} literal links, ${failures.length} mismatches. Not runtime verification.`);
  if (failures.length) { console.error(failures); process.exitCode = 1; }
}
