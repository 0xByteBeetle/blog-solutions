# What Actually Happens When Calldata Hits the EVM

[Read the article](https://andreyobruchkov1996.substack.com/p/what-actually-happens-when-calldata) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [evm/what-actually-happens-when-calldata/projects/calldata](projects/calldata)

## Recorded checks

- [evm/what-actually-happens-when-calldata/projects/calldata: build-checked](../../verification/restored-evm-builds.json) (2026-10-30)

  Checked with: `forge build`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | program | [published source](projects/calldata/src/Example.sol) |
| [2](published.md#block-2) | annotated-bytecode | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [3](published.md#block-3) | opcode-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [4](published.md#block-4) | annotated-opcodes | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [5](published.md#block-5) | annotated-opcodes | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [6](published.md#block-6) | annotated-opcodes | Preserved excerpt; runnable implementation scope remains to be reviewed |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/what-actually-happens-when-calldata/supplementary/foundry/src/Internals.sol](supplementary/foundry/src/Internals.sol)
- [evm/what-actually-happens-when-calldata/supplementary/foundry/src/Tracing.sol](supplementary/foundry/src/Tracing.sol)
