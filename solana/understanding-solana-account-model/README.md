# Derive and reconstruct the article's vault PDA

[Article](https://andreyobruchkov1996.substack.com/p/understanding-solana-account-model)

`pda.mjs` is a supplemental executable worked example of `[b"my_vault", user.key().as_ref()]`. It derives the canonical bump, reconstructs the address from the same seeds plus bump, and independently checks the SHA-256 preimage and off-curve property. It creates no account and uses no wallet or RPC.

With Node.js 22, from this folder:

```sh
npm ci --ignore-scripts
npm run example
npm test
```

The public fixtures are 32 bytes of `0x02` for the user and `0x01` for the program ID. They yield PDA `GUbHoBBmkFEK4UcopMHwJFS4mTxPkaBJNm6suyzpL48Y`, bump `255`. They stand in for the article's unspecified user/program IDs, not deployed accounts.

Tests cover reconstruction, off-curve/canonical bump, changed user/program/seed order and excessive seed length. A PDA's derivation alone does not initialize its account or demonstrate an on-chain `invoke_signed` call.
