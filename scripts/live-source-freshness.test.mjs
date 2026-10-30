import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {validateFreshness} from './check-live-source-freshness.mjs';
const root = path.resolve(import.meta.dirname, '..');
const report = JSON.parse(fs.readFileSync(path.join(root, 'verification/live-source-freshness-2026-10-30.json')));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog/articles.json')));
test('dated live observation matches all saved EVM/Solana blocks', () => {
  const result = validateFreshness(report, catalog);
  assert.equal(result.articles, 53);
  assert.equal(result.blocks, 494);
});

test('changed source hash or reordered blocks invalidates old live evidence', () => {
  const changed = structuredClone(catalog);
  const article = changed.find(a => a.chain === 'evm' && a.sourceBlocks.length > 1);
  article.sourceBlocks[0].sha256 = '0'.repeat(64);
  assert.throws(() => validateFreshness(report, changed), /no longer matches/);
  const reordered = structuredClone(catalog);
  reordered.find(a => a.chain === 'evm' && a.sourceBlocks.length > 1).sourceBlocks.reverse();
  assert.throws(() => validateFreshness(report, reordered), /no longer matches/);
});
test('missing browser observation does not become a passing partial audit', () => {
  const incomplete = structuredClone(report);
  incomplete.articles.pop();
  assert.throws(() => validateFreshness(incomplete, catalog), /incomplete or stale/);
});
