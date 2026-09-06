# ABI Encoding Deep Dive: How Solidity Turns Your Data into Bytes

[Read the article](https://andreyobruchkov1996.substack.com/p/abi-encoding-deep-dive-how-solidity) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Recovered source

- [examples/evm/storage](../../../examples/evm/storage)

## Recorded checks

- [examples/evm/storage: runtime-verified](../../../verification/restored-evm.json) (2026-09-06)

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | program | [published source](../../../examples/evm/storage/src/Storage.sol) |
| [2](published.md#block-2) | abi-json | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | worked-selector | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | encoded-calldata | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | decoding-fragment-and-values | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/foundry/src/Internals.sol](../../../evm/foundry/src/Internals.sol)
- [evm/foundry/src/Tracing.sol](../../../evm/foundry/src/Tracing.sol)
