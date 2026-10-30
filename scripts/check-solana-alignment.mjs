// Exact, reviewed formatting adaptations only; not a Rust/TypeScript parser.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function adaptReviewedBlock(slug, index, source) {
  const key = `${slug}:${index}`;
  if (key === 'solana-deep-dive-unpacking-borsh:2') {
    return source.replace('YourProgramIdHere...', 'Bo8J1of9EuuGw3DvSgTdV7Fug65oD7cERLsf5rzF6PG4');
  }
  if (key === 'solana-deep-dive-unpacking-borsh:10') {
    // Three reviewed lines, no multiline string/template.
    return source.split('\n').map((line, i) => i ? '    ' + line : line).join('\n');
  }
  if (key === 'transfer-hooks-on-solana-anchor-031:6') {
    // Three-line Rust generic call, only nested indentation changes.
    return source.split('\n').map((line, i) => i ? '        ' + line : line).join('\n');
  }
  if (['understanding-solana-part-6-transactions:1',
       'understanding-solana-part-6-transactions:4',
       'understanding-solana-part-6-transactions:5',
       'understanding-solana-part-3-anchor:7',
       'understanding-solana-part-3-anchor:13'].includes(key)) {
    // Manually inspected occurrences are quote delimiters/comment examples.
    // No blanket whitespace removal or template/string-body normalization.
    let adapted = source.replace(/[“”]/g, '"');
    if (key === 'understanding-solana-part-3-anchor:7') {
      adapted = adapted.replace(/’info/g, "'info"); // Rust lifetime, not a string
    }
    if (key === 'understanding-solana-part-3-anchor:13') {
      adapted = adapted.replace(
        'PublicKey.findProgramAddressSync(\n    [Buffer.from("user"), wallet.publicKey.toBuffer()],\n    program.programId\n  )',
        'PublicKey.findProgramAddressSync([Buffer.from("user"), wallet.publicKey.toBuffer()], program.programId)');
    }
    return adapted;
  }
  return source;
}

export function auditSolana(root) {
  const articles = JSON.parse(fs.readFileSync(path.join(root, 'catalog/articles.json')));
  const results = [];
  for (const article of articles.filter(a => a.chain === 'solana')) {
    const snapshot = fs.readFileSync(path.join(root, `${article.directory||`articles/solana/${article.slug}`}/published.md`), 'utf8');
    const blocks = new Map([...snapshot.matchAll(/## Block (\d+)\n\nSHA-256: `[a-f0-9]{64}`\n\n````text\n([\s\S]*?)\n````/g)].map(m => [+m[1], m[2]]));
    for (const block of article.sourceBlocks) {
      for (const relative of block.implementations) {
        const published = blocks.get(block.index);
        if (published === undefined) throw new Error(`Missing ${article.slug}:${block.index}`);
        const implementation = fs.readFileSync(path.join(root, relative), 'utf8');
        results.push({slug:article.slug, block:block.index, path:relative,
          exact:implementation.includes(published),
          reviewedMatch:implementation.includes(adaptReviewedBlock(article.slug, block.index, published))});
      }
    }
  }
  return results;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const results = auditSolana(path.resolve(import.meta.dirname, '..'));
  const failures = results.filter(r => !r.reviewedMatch);
  console.log(`Solana declared links: ${results.length}; exact: ${results.filter(r => r.exact).length}; reviewed formatting/placeholder: ${results.filter(r => !r.exact && r.reviewedMatch).length}; failures: ${failures.length}. Not runtime verification.`);
  if (failures.length) { console.error(failures); process.exitCode = 1; }
}
