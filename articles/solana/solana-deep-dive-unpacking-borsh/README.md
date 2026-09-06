# Solana Deep Dive: Unpacking Borsh Serialization Under the Hood

[Read the article](https://andreyobruchkov1996.substack.com/p/solana-deep-dive-unpacking-borsh) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Recovered source

- [examples/solana/borsh-proposal](../../../examples/solana/borsh-proposal)
- [examples/solana/borsh-profile](../../../examples/solana/borsh-profile)

  Run: `node scripts/run-original-anchor.mjs borsh-profile`

## Recorded checks

- [examples/solana/borsh-profile: runtime-verified](../../../verification/borsh-profile.json) (2026-09-06)

  Checked with: `node scripts/run-original-anchor.mjs borsh-profile`
- [examples/solana/borsh-proposal: runtime-verified](../../../verification/borsh-proposal.json) (2026-09-06)

  Checked with: `node scripts/run-original-anchor.mjs borsh-proposal`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | struct-fragment | Preserved in the published block; runnable mapping pending |
| [2](published.md#block-2) | program | [published source](../../../examples/solana/borsh-profile/programs/borsh_deep_dive/src/lib.rs) |
| [3](published.md#block-3) | integration-test | [published source](../../../examples/solana/borsh-profile/tests/published.ts) |
| [4](published.md#block-4) | published-output | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | published-hash | Preserved in the published block; runnable mapping pending |
| [6](published.md#block-6) | published-output | Preserved in the published block; runnable mapping pending |
| [7](published.md#block-7) | published-output | Preserved in the published block; runnable mapping pending |
| [8](published.md#block-8) | published-output | Preserved in the published block; runnable mapping pending |
| [9](published.md#block-9) | struct-fragment | [published source](../../../examples/solana/borsh-proposal/programs/borsh_deep_dive/src/lib.rs) |
| [10](published.md#block-10) | test-data-fragment | [published source](../../../examples/solana/borsh-proposal/tests/borsh_deep_dive.ts) |
| [11](published.md#block-11) | published-output | Preserved in the published block; runnable mapping pending |
| [12](published.md#block-12) | upstream-pseudocode | Preserved in the published block; runnable mapping pending |
| [13](published.md#block-13) | upstream-pseudocode | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [solana/anchor/programs/borsh_lab](../../../solana/anchor/programs/borsh_lab)
