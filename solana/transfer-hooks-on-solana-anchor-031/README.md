# Transfer Hooks on Solana: Anchor 0.31 & Token-2022

[Read the article](https://andreyobruchkov1996.substack.com/p/transfer-hooks-on-solana-anchor-031) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [solana/transfer-hooks-on-solana-anchor-031/projects/transfer-hook](projects/transfer-hook)
- [solana/transfer-hooks-on-solana-anchor-031/projects/transfer-hook-original](projects/transfer-hook-original)

  Run: `node scripts/run-original-anchor.mjs transfer-hook-original --regression`
- [solana/transfer-hooks-on-solana-anchor-031/additional-examples](additional-examples)

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | dependency-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [2](published.md#block-2) | account-context | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [3](published.md#block-3) | upstream-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [4](published.md#block-4) | instruction-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [5](published.md#block-5) | instruction-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [6](published.md#block-6) | instruction-fragment | [published source](projects/transfer-hook/published-program.rs) |
| [7](published.md#block-7) | program | [published source](projects/transfer-hook/published-program.rs); [original repo variant](projects/transfer-hook-original/programs/transfer-hook-project/src/lib.rs) |
| [8](published.md#block-8) | configuration | Reference/command/output preserved; no standalone program implied |
| [9](published.md#block-9) | commands | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [10](published.md#block-10) | commands | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [11](published.md#block-11) | commands | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [12](published.md#block-12) | client-program | [published source](projects/transfer-hook/published-client.ts) |
| [13](published.md#block-13) | intentional-failure-command | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [14](published.md#block-14) | published-failure-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [15](published.md#block-15) | command | Reference/command/output preserved; no standalone program implied |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [solana/transfer-hooks-on-solana-anchor-031/supplementary/anchor/programs/transfer_hook](supplementary/anchor/programs/transfer_hook)
