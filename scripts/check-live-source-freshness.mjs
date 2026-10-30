// Bind the dated browser observation to current saved EVM/Solana block hashes.
// This is not a new network fetch, semantic review, or runtime verification.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export function validateFreshness(report, catalog) {
  const expected = catalog.filter(a => ['evm', 'solana'].includes(a.chain));
  assert.equal(report.articles.length, expected.length, 'Freshness scope is incomplete or stale');
  const observed = new Map(report.articles.map(a => [a.url, a]));
  assert.equal(observed.size, report.articles.length, 'Duplicate freshness URL');
  let blocks = 0;
  for (const article of expected) {
    const entry = observed.get(article.url);
    assert.ok(entry, `Missing browser observation: ${article.url}`);
    assert.equal(entry.chain, article.chain);
    assert.equal(entry.slug, article.slug);
    assert.equal(entry.blockCount, article.sourceBlocks.length);
    assert.ok(entry.exactMatch && entry.pageIdentityMatches && entry.renderedTextMatches);
    const digest = crypto.createHash('sha256').update(article.sourceBlocks.map(b => b.sha256).join('\n')).digest('hex');
    assert.equal(entry.orderedBlockHashesSha256, digest, `Live observation no longer matches saved blocks: ${article.slug}`);
    blocks += entry.blockCount;
  }
  assert.equal(blocks, report.summary.exactMatchedBlocks);
  return {articles: expected.length, blocks, captured: report.captureWindowUtc};
}
export function checkFreshness(root) {
  return validateFreshness(JSON.parse(fs.readFileSync(path.join(root, 'verification/live-source-freshness-2026-10-30.json'))), JSON.parse(fs.readFileSync(path.join(root, 'catalog/articles.json'))));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkFreshness(path.resolve(import.meta.dirname, '..'));
  console.log(`Dated live-source evidence matches ${result.articles} articles / ${result.blocks} saved blocks. Observation window: ${result.captured.first} to ${result.captured.last}. Not a new live fetch or runtime pass.`);
}
