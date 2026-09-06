# What Actually Happens When Calldata Hits the EVM

[Read the article](https://andreyobruchkov1996.substack.com/p/what-actually-happens-when-calldata) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Recovered source

- [examples/evm/calldata](../../../examples/evm/calldata)

## Recorded checks

- [examples/evm/calldata: build-checked](../../../verification/restored-builds.json) (2026-09-06)

  Checked with: `forge build`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | program | [published source](../../../examples/evm/calldata/src/Example.sol) |
| [2](published.md#block-2) | annotated-bytecode | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | opcode-fragment | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | annotated-opcodes | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | annotated-opcodes | Preserved in the published block; runnable mapping pending |
| [6](published.md#block-6) | annotated-opcodes | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/foundry/src/Internals.sol](../../../evm/foundry/src/Internals.sol)
- [evm/foundry/src/Tracing.sol](../../../evm/foundry/src/Tracing.sol)
