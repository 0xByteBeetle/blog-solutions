import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
test('published and normalized source inputs retain their recorded hashes',()=>{
 for(const row of JSON.parse(fs.readFileSync(root+'/source-inputs.json'))){
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(root+'/'+row.path)).digest('hex'),row.sha256,row.path);
 }
});
test('dependencies and manifests are article-local',()=>{
 const pkg=JSON.parse(fs.readFileSync(root+'/runtime-deps/package.json'));
 const lock=JSON.parse(fs.readFileSync(root+'/runtime-deps/package-lock.json'));
 assert.equal(pkg.devDependencies['@coral-xyz/anchor'],'0.31.1');
 assert.equal(pkg.devDependencies['@solana/web3.js'],'1.98.4');
 assert.deepEqual(lock.packages[''].devDependencies,pkg.devDependencies);
 for(const file of ['workspace-template/Cargo.toml','workspace-template/Cargo.lock','workspace-template/tsconfig.json','scripts/check-toolchain.mjs'])assert.ok(fs.existsSync(root+'/'+file));
});
test('runtime refuses missing action acknowledgement before tools or key generation',()=>{
 const r=spawnSync(process.execPath,[root+'/scripts/run-local.mjs','--regression'],{encoding:'utf8'});
 assert.notEqual(r.status,0);assert.match(r.stderr,/Refusing execution/);
});
test('runtime rejects public provider or external wallet before tools or key generation',()=>{
 for(const extra of [{ANCHOR_PROVIDER_URL:'https://api.devnet.solana.com'},{ANCHOR_WALLET:'/tmp/not-a-real-wallet'}]){
  const r=spawnSync(process.execPath,[root+'/scripts/run-local.mjs','--execute-local','--regression'],{encoding:'utf8',env:{...process.env,...extra}});
  assert.notEqual(r.status,0);assert.match(r.stderr,/Non-loopback|Personal\/external/);
 }
});
