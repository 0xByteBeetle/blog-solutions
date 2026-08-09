# Where Token Metadata Lives on Solana: From Convention to Explicit Data

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/where-token-metadata-lives-on-solana)

Published: 2026-01-19

The article contains 5 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### Canonical Metaplex metadata PDA derivation and CreateMetadataAccountV3 instruction construction

Code: `solana/metadata`

Run:

```bash
cd solana/metadata && npm test && npm run check
```

### Classic Token plus metadata, fees, permanent delegate, non-transferable, frozen, memo, and interest extensions

Code: `solana/token-2022/run-local.sh`

Run:

```bash
./solana/token-2022/run-local.sh
```

## Verification boundary

PDA derivation and instruction construction execute in tests. The network scripts are type-checked and require a funded devnet-only mint authority to submit.
