# Transfer Hooks on Solana: Anchor 0.31 & Token-2022

[Read the article](https://andreyobruchkov1996.substack.com/p/transfer-hooks-on-solana-anchor-031) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Recovered source

- [examples/solana/transfer-hook](../../../examples/solana/transfer-hook)
- [examples/solana/transfer-hook-original](../../../examples/solana/transfer-hook-original)

  Run: `node scripts/run-original-anchor.mjs transfer-hook-original --regression`

## Recorded checks

- [examples/solana/transfer-hook-original: runtime-verified](../../../verification/transfer-hook-original-regression.json) (2026-09-06)

  Checked with: `node scripts/run-original-anchor.mjs transfer-hook-original --regression`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | dependency-fragment | Preserved in the published block; runnable mapping pending |
| [2](published.md#block-2) | account-context | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | upstream-fragment | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | instruction-fragment | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | instruction-fragment | Preserved in the published block; runnable mapping pending |
| [6](published.md#block-6) | instruction-fragment | [published source](../../../examples/solana/transfer-hook/published-program.rs) |
| [7](published.md#block-7) | program | [published source](../../../examples/solana/transfer-hook/published-program.rs); [original repo variant](../../../examples/solana/transfer-hook-original/programs/transfer-hook-project/src/lib.rs) |
| [8](published.md#block-8) | configuration | Preserved in the published block; runnable mapping pending |
| [9](published.md#block-9) | commands | Preserved in the published block; runnable mapping pending |
| [10](published.md#block-10) | commands | Preserved in the published block; runnable mapping pending |
| [11](published.md#block-11) | commands | Preserved in the published block; runnable mapping pending |
| [12](published.md#block-12) | client-program | [published source](../../../examples/solana/transfer-hook/published-client.ts) |
| [13](published.md#block-13) | intentional-failure-command | Preserved in the published block; runnable mapping pending |
| [14](published.md#block-14) | published-failure-output | Preserved in the published block; runnable mapping pending |
| [15](published.md#block-15) | command | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [solana/anchor/programs/transfer_hook](../../../solana/anchor/programs/transfer_hook)
