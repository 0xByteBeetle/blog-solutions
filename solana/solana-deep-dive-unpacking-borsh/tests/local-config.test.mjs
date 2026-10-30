import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
test('checked-in config fails closed without a wallet',()=>{
 const config=fs.readFileSync(path.join(root,"proposal/Anchor.toml"),'utf8');
 assert.match(config,/cluster = "localnet"/);
 assert.match(config,/wallet = "\.local\/use-runner-wallet-not-created\.json"/);
 assert.doesNotMatch(config,/~\/|\/Users\/|devnet|mainnet/);
 assert.equal(fs.existsSync(path.join(root,"proposal",'.local/use-runner-wallet-not-created.json')),false);
});
