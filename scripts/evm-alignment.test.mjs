import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {auditEvm, normalizePublishedText, containsLiteralPreserving, jsonAbiLiteralEqual} from './check-evm-alignment.mjs';

const root = path.resolve(import.meta.dirname, '..');
test('all declared EVM implementation links match the preserved published text', () => {
  const result = auditEvm(root);
  assert.ok(result.articles.length > 0);
  assert.deepEqual(result.failures, []);
});
test('normalization is explicitly textual, not a claim of semantic equivalence', () => {
  assert.equal(normalizePublishedText('x = “a b”;'), 'x="ab";');
  assert.notEqual(normalizePublishedText('return 1;'), normalizePublishedText('return 2;'));
  assert.equal(containsLiteralPreserving('x = \"a b\";', 'x = \"ab\";'), false);
  assert.equal(containsLiteralPreserving('x = `a b`;', 'x = `ab`;'), false);
  assert.equal(containsLiteralPreserving('uintx;', 'uint x;'), false);
  assert.equal(containsLiteralPreserving('x++;', 'x + +;'), false);
  assert.equal(containsLiteralPreserving('x=\"a b\";', 'x = “a b”;'), true);
});
test('an incorrect mapping is detected even when each file is individually intact', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'evm-alignment-'));
  try {
    fs.mkdirSync(path.join(dir, 'catalog'));
    fs.mkdirSync(path.join(dir, 'articles/evm/example'), {recursive: true});
    fs.mkdirSync(path.join(dir, 'examples'));
    fs.writeFileSync(path.join(dir, 'catalog/articles.json'), JSON.stringify([{chain: 'evm', slug: 'example', title: 'Fixture', url: 'https://example.invalid', verification: {status: 'source-restored'}, sourceBlocks: [{index: 1, kind: 'program', implementations: ['examples/program.sol']}]}]));
    fs.writeFileSync(path.join(dir, 'articles/evm/example/published.md'), '## Block 1\n\nSHA-256: `' + 'a'.repeat(64) + '`\n\n````text\nreturn 1;\n````');
    fs.writeFileSync(path.join(dir, 'examples/program.sol'), 'return 2;');
    assert.equal(auditEvm(dir).failures.length, 1);
    fs.writeFileSync(path.join(dir, 'examples/program.sol'), 'function x() { return 1; }');
    assert.deepEqual(auditEvm(dir).failures, []);
  } finally { fs.rmSync(dir, {recursive: true, force: true}); }
});

test('reviewed JSON ABI formatting does not hide changed string contents or keys', () => {
  assert.equal(jsonAbiLiteralEqual('`[{"name":"a b"}]`', '`[ { "name" : "a b" } ]`'), true);
  assert.equal(jsonAbiLiteralEqual('`[{"name":"a b"}]`', '`[{"name":"ab"}]`'), false);
  assert.equal(jsonAbiLiteralEqual('`[{"name":"a"}]`', '`[{"name":"b","name":"a"}]`'), false);
  assert.equal(jsonAbiLiteralEqual('`hello world`', '`helloworld`'), false);
});
