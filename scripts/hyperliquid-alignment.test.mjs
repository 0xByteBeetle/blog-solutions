import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {auditHyperliquid} from './check-hyperliquid-alignment.mjs';
const root = path.resolve(import.meta.dirname, '..');
test('five live-captured articles retain exact implementation links', () => {
  const report = auditHyperliquid(root);
  assert.equal(report.articles, 5);
  assert.equal(report.blocks, 79);
  assert.equal(report.mappings.length, 29);
  assert.deepEqual(report.mappings.filter(x => !x.exact), []);
});
test('a literal alteration is rejected, not whitespace-normalized away', () => {
  const target = 'examples/hyperliquid/signing-nonces/01_sign_and_recover.py';
  const report = auditHyperliquid(root, (filename, encoding) => {
    const content = fs.readFileSync(filename, encoding);
    return filename.endsWith(target) ? content.replace('Hyperliquid', 'Hyper liquid') : content;
  });
  assert.ok(report.mappings.some(x => x.path === target && !x.exact));
});
