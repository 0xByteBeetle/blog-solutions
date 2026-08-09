# Solana Token-2022 Transfer Hooks and the Fee-on-Transfer Extension

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/solana-token-2022-transfer-hooks)

Published: 2026-03-12

The article contains 9 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### Classic Token plus metadata, fees, permanent delegate, non-transferable, frozen, memo, and interest extensions

Code: `solana/token-2022/run-local.sh`

Run:

```bash
./solana/token-2022/run-local.sh
```

### A deployed Token-2022 transfer hook with ExtraAccountMetaList and accepted and rejected transfers

Code: `solana/anchor/programs/transfer_hook`

Run:

```bash
cd solana/anchor && ./scripts/test.sh
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
