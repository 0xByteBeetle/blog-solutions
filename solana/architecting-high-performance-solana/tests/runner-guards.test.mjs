import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const runner=path.resolve(import.meta.dirname,'../scripts/run-local.mjs');
const project="zero-copy";
test('rejects missing local acknowledgement before tools',()=>{const r=spawnSync(process.execPath,[runner,project],{encoding:'utf8'});assert.notEqual(r.status,0);assert.match(r.stderr,/Refusing execution/);});
test('rejects public provider and external wallet before tools',()=>{for(const extra of [{ANCHOR_PROVIDER_URL:'https://api.devnet.solana.com'},{ANCHOR_WALLET:'/tmp/not-a-wallet'}]){const r=spawnSync(process.execPath,[runner,project,'--execute-local'],{encoding:'utf8',env:{...process.env,...extra}});assert.notEqual(r.status,0);assert.match(r.stderr,/Non-loopback|Personal\/external/);}});
