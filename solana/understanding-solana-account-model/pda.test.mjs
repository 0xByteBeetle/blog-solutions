import test from 'node:test';
import assert from 'node:assert/strict';
import {PublicKey} from '@solana/web3.js';
import {derive, user, program} from './pda.mjs';
import {execFileSync} from 'node:child_process';

test('public fixture matches independently checked Solana CLI address and CLI output', () => {
  const output = JSON.parse(execFileSync(process.execPath, ['pda.mjs'], {encoding: 'utf8'}));
  assert.equal(output.pda, 'GUbHoBBmkFEK4UcopMHwJFS4mTxPkaBJNm6suyzpL48Y');
  assert.equal(output.bump, 255);
  assert.equal(output.reconstructed, true);
});

test('article seeds reconstruct an off-curve PDA with a canonical bump', () => {
  const {pda, bump, seeds} = derive();
  assert.equal(seeds[0].toString(), 'my_vault');
  assert.deepEqual(seeds[1], user.toBuffer());
  assert.equal(PublicKey.isOnCurve(pda.toBytes()), false);
  assert.ok(PublicKey.createProgramAddressSync([...seeds, Buffer.from([bump])], program).equals(pda));
  for (let larger = 255; larger > bump; larger--) {
    assert.throws(() => PublicKey.createProgramAddressSync([...seeds, Buffer.from([larger])], program), /off.*curve/);
  }
});
test('user, program and seed order are part of the derivation', () => {
  const original = derive();
  assert.ok(!derive(new PublicKey(Buffer.alloc(32, 3))).pda.equals(original.pda));
  assert.ok(!derive(user, new PublicKey(Buffer.alloc(32, 4))).pda.equals(original.pda));
  assert.ok(!PublicKey.findProgramAddressSync([...original.seeds].reverse(), program)[0].equals(original.pda));
});
test('oversized seeds are rejected', () => {
  assert.throws(() => PublicKey.findProgramAddressSync([Buffer.alloc(33)], program), /seed length/i);
});
