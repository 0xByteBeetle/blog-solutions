# Ethereum Calldata and Bytecode: How the EVM Knows Which Function to Call

[Read the article](https://andreyobruchkov1996.substack.com/p/ethereum-calldata-and-bytecode-how) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [evm/ethereum-calldata-and-bytecode-how/projects/bytecode](projects/bytecode)

## Recorded checks

- [evm/ethereum-calldata-and-bytecode-how/projects/bytecode: build-checked](../../verification/restored-evm-builds.json) (2026-10-30)

  Checked with: `forge build`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | api-signature | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [2](published.md#block-2) | example-call | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [3](published.md#block-3) | encoded-calldata | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [4](published.md#block-4) | encoding-layout | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [5](published.md#block-5) | command-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [6](published.md#block-6) | program | [published source](projects/bytecode/src/MiniExample.sol) |
| [7](published.md#block-7) | bytecode | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [8](published.md#block-8) | annotated-opcodes | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [9](published.md#block-9) | illustrative-transaction | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [10](published.md#block-10) | encoded-calldata | Preserved excerpt; runnable implementation scope remains to be reviewed |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/ethereum-calldata-and-bytecode-how/supplementary/foundry/src/Internals.sol](supplementary/foundry/src/Internals.sol)
- [evm/ethereum-calldata-and-bytecode-how/supplementary/foundry/src/Tracing.sol](supplementary/foundry/src/Tracing.sol)
