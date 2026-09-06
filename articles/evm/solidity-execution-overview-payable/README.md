# Solidity Execution Overview: Payable, Fallback, Calls Types, and Reverts Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/solidity-execution-overview-payable) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | instruction-fragment | Preserved in the published block; runnable mapping pending |
| [2](published.md#block-2) | api-signature | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | program-with-omitted-pragma | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | api-signatures | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | program-with-omitted-pragma | Preserved in the published block; runnable mapping pending |
| [6](published.md#block-6) | program-with-omitted-pragma | Preserved in the published block; runnable mapping pending |
| [7](published.md#block-7) | program-with-omitted-pragma | Preserved in the published block; runnable mapping pending |
| [8](published.md#block-8) | instruction-fragment | Preserved in the published block; runnable mapping pending |
| [9](published.md#block-9) | intentional-revert-fragment | Preserved in the published block; runnable mapping pending |
| [10](published.md#block-10) | instruction-fragment | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/foundry/src/Internals.sol](../../../evm/foundry/src/Internals.sol)
- [evm/foundry/src/Tracing.sol](../../../evm/foundry/src/Tracing.sol)
