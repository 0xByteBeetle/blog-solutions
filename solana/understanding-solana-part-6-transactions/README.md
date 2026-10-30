# Understanding Solana – Part 6: Transactions, Messages, and Address Lookup Tables in Practice

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-solana-part-6-transactions) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Authorized corrections

- [solana/understanding-solana-part-6-transactions/projects/wallet-token-balances-original/scripts/client-alt-ready.ts](projects/wallet-token-balances-original/scripts/client-alt-ready.ts)

  Authorized ALT-readiness variant. Waits for usable entries and consistent confirmed RPC context; original client and Rust program remain unchanged.

  Run: `node scripts/run-original-anchor.mjs wallet-token-balances-original --regression --alt-ready`

## Recovered source

- [solana/understanding-solana-part-6-transactions/projects/wallet-token-balances](projects/wallet-token-balances)
- [solana/understanding-solana-part-6-transactions/projects/wallet-token-balances-original](projects/wallet-token-balances-original)

  Run: `node scripts/run-original-anchor.mjs wallet-token-balances-original --build-only`
- [solana/understanding-solana-part-6-transactions/additional-examples](additional-examples)

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | program | [published source](projects/wallet-token-balances/lib.rs); [original repo variant](projects/wallet-token-balances-original/programs/wallet_tokens_balance/src/lib.rs) |
| [2](published.md#block-2) | command | Reference/command/output preserved; no standalone program implied |
| [3](published.md#block-3) | command | Reference/command/output preserved; no standalone program implied |
| [4](published.md#block-4) | client-setup | [published source](projects/wallet-token-balances/setup.ts); [original repo variant](projects/wallet-token-balances-original/scripts/create_alts.ts) |
| [5](published.md#block-5) | client-program | [published source](projects/wallet-token-balances/client.ts); [original repo variant](projects/wallet-token-balances-original/scripts/client.ts) |
| [6](published.md#block-6) | command | Reference/command/output preserved; no standalone program implied |
| [7](published.md#block-7) | client-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [8](published.md#block-8) | client-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [9](published.md#block-9) | client-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [10](published.md#block-10) | client-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [11](published.md#block-11) | client-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [12](published.md#block-12) | client-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [13](published.md#block-13) | client-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [solana/understanding-solana-part-6-transactions/supplementary/fundamentals](supplementary/fundamentals)
