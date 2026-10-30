import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const baseRoot=process.env.HOOK_VARIANT_TEST_BASE || root;
const hash=t=>crypto.createHash('sha256').update(t).digest('hex');

test('CHECK variant adds only the two documented comments, preserving every other byte',()=>{
 const manifest=JSON.parse(fs.readFileSync(root+'/CHECK-VARIANT.json'));
 const original=fs.readFileSync(baseRoot+'/'+manifest.base,'utf8');
 const variant=fs.readFileSync(root+'/'+manifest.variant,'utf8');
 assert.equal(hash(original),manifest.baseSha256);
 assert.equal(hash(variant),manifest.sha256);
 let restored=variant;
 for(const comment of ['    /// CHECK: PDA for extra metas\n','    /// CHECK: Mint\n']){
  assert.equal(restored.split(comment).length,2);
  restored=restored.replace(comment,'');
 }
 assert.equal(restored,original);
 assert.match(original,/pub extra_metas_account: AccountInfo<'info>,\n    pub mint: AccountInfo<'info>,/);
});

test('CHECK variant is explicit and separately recorded, never the default source',()=>{
 const runner=fs.readFileSync(root+'/scripts/run-local.mjs','utf8');
 assert.match(runner,/const checkAnnotations=process.argv.includes\('--check-annotations'\)/);
 assert.match(runner,/if\(checkAnnotations\)\{/);
 assert.match(runner,/restored!==original/);
 assert.match(runner,/checkAnnotations\?'-check-annotations'/);
 assert.match(runner,/sourceHashes\[variant\]/);
});
