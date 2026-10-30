import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity, publicKey, sol } from '@metaplex-foundation/umi';
import { getCreateMetadataAccountV3InstructionDataSerializer, getMetadataAccountDataSerializer, findMetadataPda } from '@metaplex-foundation/mpl-token-metadata';
import { PROGRAM, DATA, buildMetadata, readMetadata, plan, localUrl, requireMetadataProgram, executeLocal } from '../reproduce.mjs';
function fixture() { const umi = createUmi('http://127.0.0.1:18999'); const payer = umi.eddsa.createKeypairFromSeed(Uint8Array.from({ length: 32 }, () => 1)); const mint = umi.eddsa.createKeypairFromSeed(Uint8Array.from({ length: 32 }, () => 2)).publicKey; umi.use(keypairIdentity(payer)); return { umi, payer, mint }; }
function rawAccount(umi, payer, mint) { return { exists: true, publicKey: findMetadataPda(umi, { mint })[0], owner: PROGRAM, lamports: sol(1), executable: false, data: getMetadataAccountDataSerializer().serialize({ updateAuthority: payer.publicKey, mint, ...DATA, primarySaleHappened: false, isMutable: true, editionNonce: null, tokenStandard: null, collectionDetails: null, programmableConfig: null }) }; }
test('builder encodes the preserved V3 fields, payer/authority and derived metadata PDA without RPC', () => {
    const { umi, payer, mint } = fixture();
    umi.rpc.getAccount = () => { throw Error('unexpected RPC'); };
    const ix = buildMetadata(umi, mint).getInstructions()[0];
    assert.equal(ix.programId, PROGRAM);
    assert.equal(ix.keys[0].pubkey, findMetadataPda(umi, { mint })[0]);
    assert.equal(ix.keys[1].pubkey, mint);
    assert.equal(ix.keys[2].pubkey, payer.publicKey);
    assert.equal(ix.keys[2].isSigner, true);
    const [data] = getCreateMetadataAccountV3InstructionDataSerializer().deserialize(ix.data);
    assert.equal(ix.data[0], 33);
    assert.equal(data.data.name, 'Example Token');
    assert.equal(data.data.symbol, 'EXMPL');
    assert.equal(data.data.uri, DATA.uri);
    assert.equal(data.data.sellerFeeBasisPoints, 0);
    assert.equal(data.isMutable, true);
    const p = plan('http://127.0.0.1:18999', payer.publicKey, mint);
    assert.equal(p.steps.length, 6);
    assert.equal(p.metadata, ix.keys[0].pubkey);
});
test('mock readback decodes owner-bound metadata and rejects wrong mint/owner/missing data', async () => {
    const { umi, payer, mint } = fixture();
    const raw = rawAccount(umi, payer, mint);
    umi.rpc.getAccount = async (key) => { assert.equal(key, raw.publicKey); return raw; };
    assert.equal((await readMetadata(umi, mint)).name, DATA.name);
    for (const bad of [{ ...raw, exists: false }, { ...raw, owner: publicKey('11111111111111111111111111111111') }, { ...raw, data: Uint8Array.from([99, ...raw.data.slice(1)]) }]) {
        umi.rpc.getAccount = async () => bad;
        await assert.rejects(readMetadata(umi, mint));
    }
    const other = umi.eddsa.createKeypairFromSeed(Uint8Array.from({ length: 32 }, () => 3)).publicKey;
    umi.rpc.getAccount = async () => rawAccount(umi, payer, other);
    await assert.rejects(readMetadata(umi, mint), /mint mismatch/);
});
test('nonloopback and ambiguous RPC URLs are rejected', () => { for (const url of ['https://api.devnet.solana.com', 'http://localhost:8899', 'http://127.0.0.1:8899/?redirect=x'])
    assert.throws(() => localUrl(url)); });
test('missing local Metaplex program stops execution before nonexistent key files or CLI actions', async () => {
    const methods = [];
    const server = http.createServer(async (req, res) => { let text = ''; for await (const part of req)
        text += part; const body = JSON.parse(text); methods.push(body.method); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ jsonrpc: '2.0', id: 1, result: { value: null } })); });
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    try {
        const url = 'http://127.0.0.1:' + server.address().port;
        await assert.rejects(requireMetadataProgram(url), /program is absent/);
        await assert.rejects(executeLocal(url, '/missing-payer.json', '/missing-mint.json'), /no keys read/);
        assert.deepEqual(methods, ['getAccountInfo', 'getAccountInfo']);
    }
    finally {
        await new Promise(r => server.close(r));
    }
});
