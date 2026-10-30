# Solana Deep Dive: Unpacking Borsh Serialization Under the Hood

[Read the article](https://andreyobruchkov1996.substack.com/p/solana-deep-dive-unpacking-borsh) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [solana/solana-deep-dive-unpacking-borsh/projects/borsh-proposal](projects/borsh-proposal)
- [solana/solana-deep-dive-unpacking-borsh/projects/borsh-profile](projects/borsh-profile)

  Run: `node scripts/run-original-anchor.mjs borsh-profile`

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | struct-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [2](published.md#block-2) | program | [published source](projects/borsh-profile/programs/borsh_deep_dive/src/lib.rs) |
| [3](published.md#block-3) | integration-test | [published source](projects/borsh-profile/tests/published.ts) |
| [4](published.md#block-4) | published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [5](published.md#block-5) | published-hash | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [6](published.md#block-6) | published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [7](published.md#block-7) | published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [8](published.md#block-8) | published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [9](published.md#block-9) | struct-fragment | [published source](projects/borsh-proposal/programs/borsh_deep_dive/src/lib.rs) |
| [10](published.md#block-10) | test-data-fragment | [published source](projects/borsh-proposal/tests/borsh_deep_dive.ts) |
| [11](published.md#block-11) | published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [12](published.md#block-12) | upstream-pseudocode | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [13](published.md#block-13) | upstream-pseudocode | Preserved excerpt; runnable implementation scope remains to be reviewed |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [solana/solana-deep-dive-unpacking-borsh/supplementary/anchor/programs/borsh_lab](supplementary/anchor/programs/borsh_lab)
