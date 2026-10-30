# Token metadata clients

[Article](https://andreyobruchkov1996.substack.com/p/where-token-metadata-lives-on-solana)

The two TypeScript files are the article's metadata creation and read examples. They contain historical endpoints/addresses and wallet-dependent operations; type-checking does not execute them.

```sh
npm ci --ignore-scripts
npm run check
```

Tested with the installed Node 20.19.6 and 22.6.0 plus the pinned TypeScript/Metaplex dependencies in package-lock.json. The compatible `rpc-websockets` 9.0.4 override avoids the newer CommonJS/ESM mismatch on Node 22.6. Review credentials, addresses and network before separately authorizing any creation transaction. No key or wallet is included.

## Reproduce mint → token account → 1000 tokens → metadata → readback

`reproduce.mjs` is a supplemental explicit-input route; the two printed TypeScript files are unchanged. Restore the pinned dependencies, then run the offline builder/decoder and owned mock-RPC tests:

```sh
npm ci --ignore-scripts
npm run check
npm test
# Plan only: public addresses, no key reads, RPC calls or signing.
node reproduce.mjs --rpc-url http://127.0.0.1:8899 --payer PAYER_PUBLIC_KEY --mint NEW_MINT_PUBLIC_KEY
```

The execution route requires installed SPL CLI 5.5.0 / Solana 3.1.9 and **an already provisioned loopback validator with the executable Metaplex Token Metadata program**. An ordinary fresh validator lacks that program. The runner checks this first and stops before key reads or token creation; it does not clone/install programs or use a public-network fallback.

For a separately provisioned disposable local fixture, create two new keypairs in your own temporary directory, fund only its payer from your local faucet, and explicitly pass both absolute file paths:

```sh
# Opt-in: sends transactions only to the specified loopback validator.
node reproduce.mjs --execute-local --rpc-url http://127.0.0.1:8899 \
  --payer-keypair /ABSOLUTE/DISPOSABLE/payer.json \
  --mint-keypair /ABSOLUTE/DISPOSABLE/new-mint.json
```

It creates a legacy SPL mint with six decimals, creates the payer’s associated token account, mints 1000 tokens, submits `CreateMetadataAccountV3` with `Example Token / EXMPL / https://example.com/metadata.json`, then verifies metadata owner/PDA/mint/fields/update authority, raw supply `1000000000`, and the owner’s token balance. Each CLI call uses an explicit temporary config and loopback URL. No default wallet path is used; the caller owns the disposable keys/validator and removes them afterward. Temporary config files are deleted by the runner. Steps are separate transactions, so a later failure can leave earlier local fixture accounts created.

**Verified here:** offline instruction fields/PDA, serialized metadata decoding, malformed/mismatched account rejection, and a missing-program local RPC mock that proves failure before key reads/actions. **Not claimed:** an actual Metaplex creation transaction or end-to-end chain readback. No Metaplex program was cloned/deployed, no public faucet/transaction was used, and the URI’s off-chain JSON content is not fetched or validated.
