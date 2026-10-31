// Supplemental explicit-input reproduction. Original metadata.ts/read.ts remain unchanged.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey, keypairIdentity, signerIdentity, createNoopSigner } from '@metaplex-foundation/umi';
import { base58 } from '@metaplex-foundation/umi/serializers';
import { createMetadataAccountV3, findMetadataPda, deserializeMetadata, Key } from '@metaplex-foundation/mpl-token-metadata';
export const PROGRAM = publicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
export const DATA = { name: 'Example Token', symbol: 'EXMPL', uri: 'https://example.com/metadata.json', sellerFeeBasisPoints: 0, creators: null, collection: null, uses: null };
export function localUrl(value) { const u = new URL(value); if (u.protocol !== 'http:' || u.hostname !== '127.0.0.1' || !u.port || u.username || u.password || u.search || u.hash || u.pathname !== '/')
    throw Error('Explicit loopback RPC http://127.0.0.1:PORT required'); return u.href; }
export function buildMetadata(umi, mint) { return createMetadataAccountV3(umi, { mint: publicKey(mint), mintAuthority: umi.identity, payer: umi.identity, updateAuthority: umi.identity, data: DATA, isMutable: true, collectionDetails: null }); }
export async function rpc(url, method, params) {
    const response = await fetch(localUrl(url), { method: 'POST', redirect: 'error', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: AbortSignal.timeout(10000) });
    if (!response.ok)
        throw Error('RPC HTTP ' + response.status);
    const body = await response.json();
    if (body.error || body.jsonrpc !== '2.0' || body.id !== 1 || !Object.hasOwn(body, 'result'))
        throw Error('Invalid/error RPC response');
    return body.result;
}
export async function requireMetadataProgram(url) { const account = await rpc(url, 'getAccountInfo', [PROGRAM, { encoding: 'base64' }]); if (account?.value?.executable !== true)
    throw Error('Metaplex Token Metadata program is absent; no keys read or creation attempted. No automatic clone/install.'); }
export async function readMetadata(umi, mint) {
    mint = publicKey(mint);
    const [address] = findMetadataPda(umi, { mint });
    const raw = await umi.rpc.getAccount(address, { commitment: 'confirmed' });
    if (!raw.exists)
        throw Error('Metadata account absent');
    if (raw.owner !== PROGRAM || raw.data[0] !== Key.MetadataV1)
        throw Error('Wrong metadata owner/discriminator');
    const metadata = deserializeMetadata(raw);
    if (metadata.mint !== mint)
        throw Error('Metadata mint mismatch');
    for (const field of ['name', 'symbol', 'uri'])
        if (metadata[field].replace(/\0+$/, '') !== DATA[field])
            throw Error('Metadata field mismatch: ' + field);
    if (metadata.sellerFeeBasisPoints !== 0 || !metadata.isMutable)
        throw Error('Metadata flags mismatch');
    return metadata;
}
export function validateTokenState(supply, accounts, payer, mint) {
        if (supply.value.amount !== '1000000000000' || supply.value.decimals !== 9)
            throw Error('Mint supply/decimals mismatch');
        const amount = accounts.value.reduce((sum, x) => { const info = x.account.data.parsed.info; if (info.owner !== payer || info.mint !== mint || info.tokenAmount.decimals !== 9)
            throw Error('Token account mismatch'); return sum + BigInt(info.tokenAmount.amount); }, 0n);
        if (amount !== 1000000000000n)
            throw Error('Owner token balance mismatch');
    return amount;
}
function command(name, args) { const result = spawnSync(name, args, { encoding: 'utf8', timeout: 120000 }); if (result.status !== 0)
    throw Error(name + ' failed: ' + (result.stderr || result.error)); return result.stdout.trim(); }
function readKey(umi, file) { if (!file || !path.isAbsolute(file) || path.resolve(file).startsWith(path.join(os.homedir(), '.config', 'solana') + path.sep))
    throw Error('Explicit disposable keypair outside the default wallet directory required'); const bytes = JSON.parse(fs.readFileSync(file, 'utf8')); if (!Array.isArray(bytes) || bytes.length !== 64 || bytes.some(x => !Number.isInteger(x) || x < 0 || x > 255))
    throw Error('Invalid 64-byte keypair'); return umi.eddsa.createKeypairFromSecretKey(Uint8Array.from(bytes)); }
export async function executeLocal(url, payerFile, mintFile) {
    url = localUrl(url);
    await requireMetadataProgram(url); // Before key reads, config creation or signed commands.
    if (!/^spl-token-cli 5\.5\.0(?:\s|$)/.test(command('spl-token', ['--version'])) || !/^solana-cli 3\.1\.9(?:\s|$)/.test(command('solana', ['--version'])))
        throw Error('Requires reviewed SPL 5.5.0 / Solana 3.1.9');
    const umi = createUmi(url, { commitment: 'confirmed' });
    const payer = readKey(umi, payerFile), mint = readKey(umi, mintFile);
    umi.use(keypairIdentity(payer));
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'metadata-config-'));
    const config = path.join(temporary, 'solana.yml');
    try {
        command('solana', ['config', 'set', '--config', config, '--url', url, '--keypair', payerFile]);
        const token = (...args) => command('spl-token', ['--url', url, '-C', config, ...args]);
        token('create-token', '--decimals', '9', mintFile); // New mint, payer is mint authority.
        token('create-account', mint.publicKey); // Payer's associated token account.
        token('mint', mint.publicKey, '1000'); // 1,000 tokens = 1,000,000,000,000 base units.
        const { signature, result } = await buildMetadata(umi, mint.publicKey).sendAndConfirm(umi);
        if (result.value.err !== null)
            throw Error('Metadata transaction failed: ' + JSON.stringify(result.value.err));
        const metadata = await readMetadata(umi, mint.publicKey);
        if (metadata.updateAuthority !== payer.publicKey)
            throw Error('Update authority mismatch');
        const supply = await rpc(url, 'getTokenSupply', [mint.publicKey, { commitment: 'confirmed' }]);
        const accounts = await rpc(url, 'getTokenAccountsByOwner', [payer.publicKey, { mint: mint.publicKey }, { encoding: 'jsonParsed', commitment: 'confirmed' }]);
        const amount = validateTokenState(supply, accounts, payer.publicKey, mint.publicKey);
        console.log(JSON.stringify({ mint: mint.publicKey, metadata: metadata.publicKey, metadataSignature: base58.deserialize(signature)[0], updateAuthority: metadata.updateAuthority, name: metadata.name.replace(/\0+$/, ''), symbol: metadata.symbol.replace(/\0+$/, ''), uri: metadata.uri.replace(/\0+$/, ''), decimals: supply.value.decimals, supply: supply.value.amount, ownerRawBalance: String(amount) }, null, 2));
    }
    finally {
        fs.rmSync(temporary, { recursive: true, force: true });
    }
}
export function plan(url, payer, mint) { url = localUrl(url); const umi = createUmi(url).use(signerIdentity(createNoopSigner(publicKey(payer)))); const builder = buildMetadata(umi, mint); return { rpc: url, mint: publicKey(mint), metadata: findMetadataPda(umi, { mint: publicKey(mint) })[0], steps: ['Require existing executable Metaplex program', 'Create nine-decimal SPL mint using explicit disposable mint keypair', 'Create payer associated token account', 'Mint 1000 (1000000000000 base units)', 'Send CreateMetadataAccountV3', 'Read metadata, supply and owner balance'], metadataProgram: builder.getInstructions()[0].programId }; }
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const { values } = parseArgs({ options: { 'rpc-url': { type: 'string' }, payer: { type: 'string' }, mint: { type: 'string' }, 'payer-keypair': { type: 'string' }, 'mint-keypair': { type: 'string' }, 'execute-local': { type: 'boolean' } } });
        if (!values['rpc-url'])
            throw Error('--rpc-url is required');
        if (values['execute-local'])
            await executeLocal(values['rpc-url'], values['payer-keypair'], values['mint-keypair']);
        else
            console.log(JSON.stringify(plan(values['rpc-url'], values.payer, values.mint), null, 2));
    }
    catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}
