# Understanding Solana - Part 5: Transaction, Serialization, Signatures, Fees, and Runtime Execution

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/understanding-solana-part-5-transaction)

Published: 2025-12-17

The article contains 9 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### Accounts, PDAs, Borsh bytes, messages, signatures, fee math, and address lookup tables

Code: `solana/fundamentals`

Run:

```bash
cargo test --manifest-path solana/fundamentals/Cargo.toml
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
