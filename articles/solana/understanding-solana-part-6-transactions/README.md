# Understanding Solana – Part 6: Transactions, Messages, and Address Lookup Tables in Practice

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-solana-part-6-transactions) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Recovered source

- [examples/solana/wallet-token-balances](../../../examples/solana/wallet-token-balances)
- [examples/solana/wallet-token-balances-original](../../../examples/solana/wallet-token-balances-original)

  Run: `node scripts/run-original-anchor.mjs wallet-token-balances-original --build-only`

## Recorded checks

- [examples/solana/wallet-token-balances-original: runtime-verified](../../../verification/wallet-token-balances-original-regression-prepared-alt.json) (2026-09-06)

  Checked with: `node scripts/run-original-anchor.mjs wallet-token-balances-original --regression --prepared-alt`
- [examples/solana/wallet-token-balances-original: failed](../../../verification/wallet-token-balances-original-regression.json) (2026-09-06)

  Checked with: `node scripts/run-original-anchor.mjs wallet-token-balances-original --regression`
- [examples/solana/wallet-token-balances-original: build-checked](../../../verification/wallet-token-balances-original.json) (2026-09-06)

  Checked with: `node scripts/run-original-anchor.mjs wallet-token-balances-original --build-only`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | program | [published source](../../../examples/solana/wallet-token-balances/lib.rs); [original repo variant](../../../examples/solana/wallet-token-balances-original/programs/wallet_tokens_balance/src/lib.rs) |
| [2](published.md#block-2) | command | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | command | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | client-setup | [published source](../../../examples/solana/wallet-token-balances/setup.ts); [original repo variant](../../../examples/solana/wallet-token-balances-original/scripts/create_alts.ts) |
| [5](published.md#block-5) | client-program | [published source](../../../examples/solana/wallet-token-balances/client.ts); [original repo variant](../../../examples/solana/wallet-token-balances-original/scripts/client.ts) |
| [6](published.md#block-6) | command | Preserved in the published block; runnable mapping pending |
| [7](published.md#block-7) | client-fragment | Preserved in the published block; runnable mapping pending |
| [8](published.md#block-8) | client-fragment | Preserved in the published block; runnable mapping pending |
| [9](published.md#block-9) | client-fragment | Preserved in the published block; runnable mapping pending |
| [10](published.md#block-10) | client-fragment | Preserved in the published block; runnable mapping pending |
| [11](published.md#block-11) | client-fragment | Preserved in the published block; runnable mapping pending |
| [12](published.md#block-12) | client-fragment | Preserved in the published block; runnable mapping pending |
| [13](published.md#block-13) | client-fragment | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [solana/fundamentals](../../../solana/fundamentals)
