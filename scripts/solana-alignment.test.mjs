import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import {adaptReviewedBlock, auditSolana} from './check-solana-alignment.mjs';

test('all 18 Solana links match exact text or individually reviewed adaptations', () => {
  const results = auditSolana(path.resolve(import.meta.dirname, '..'));
  assert.equal(results.length, 18);
  assert.equal(results.filter(r => r.exact).length, 10);
  assert.deepEqual(results.filter(r => !r.reviewedMatch), []);
});
test('reviewed quote repair preserves literal whitespace, templates and token boundaries', () => {
  const slug = 'understanding-solana-part-6-transactions';
  const a = source => adaptReviewedBlock(slug, 5, source);
  assert.equal(a('const s = ”a b”;'), 'const s = "a b";');
  assert.notEqual(a('const s = ”a b”;'), 'const s = "ab";');
  assert.equal(a('const s = `a\n b ${x}`;'), 'const s = `a\n b ${x}`;');
  assert.notEqual(a('const s = `a b`;'), 'const s = `ab`;');
  assert.notEqual(a('let x = 1;'), 'letx=1;');
  assert.notEqual(a('x + +y'), 'x++y');
});
test('Rust lifetime repair is scoped, and block-specific reflow does not erase other whitespace', () => {
  assert.equal(adaptReviewedBlock('understanding-solana-part-3-anchor', 7, 'Account<’info, User>'), "Account<'info, User>");
  assert.equal(adaptReviewedBlock('other', 7, 'Account<’info, User>'), 'Account<’info, User>');
  assert.equal(adaptReviewedBlock('transfer-hooks-on-solana-anchor-031', 6, 'call::<\n    Type\n>();'), 'call::<\n            Type\n        >();');
  assert.equal(adaptReviewedBlock('understanding-solana-part-3-anchor', 13, 'const text = `hello\n  world`;'), 'const text = `hello\n  world`;');
  assert.equal(adaptReviewedBlock('other', 2, 'YourProgramIdHere...'), 'YourProgramIdHere...');
});
