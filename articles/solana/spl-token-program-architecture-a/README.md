# SPL Token Program Architecture: A Technical Overview

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/spl-token-program-architecture-a)

Published: 2026-01-13

The article contains 13 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### Classic Token plus metadata, fees, permanent delegate, non-transferable, frozen, memo, and interest extensions

Code: `solana/token-2022/run-local.sh`

Run:

```bash
./solana/token-2022/run-local.sh
```

### Accounts, PDAs, Borsh bytes, messages, signatures, fee math, and address lookup tables

Code: `solana/fundamentals`

Run:

```bash
cargo test --manifest-path solana/fundamentals/Cargo.toml
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
