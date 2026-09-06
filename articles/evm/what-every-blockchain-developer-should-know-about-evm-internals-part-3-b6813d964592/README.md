# What Every Blockchain Developer Should Know About EVM Internals — Part 3

[Read the article](https://andreyobruchkov1996.substack.com/p/what-every-blockchain-developer-should-know-about-evm-internals-part-3-b6813d964592) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | program | [published source](../../../examples/evm/storage-validation/src/Storage.sol) |
| [2](published.md#block-2) | installation-commands | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | inspection-commands | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | setup-commands | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | command | Preserved in the published block; runnable mapping pending |
| [6](published.md#block-6) | deployment-command | Preserved in the published block; runnable mapping pending |
| [7](published.md#block-7) | illustrative-output | Preserved in the published block; runnable mapping pending |
| [8](published.md#block-8) | integration-test | [published source](../../../examples/evm/storage-validation/test/Tracing.t.sol) |
| [9](published.md#block-9) | command | Preserved in the published block; runnable mapping pending |
| [10](published.md#block-10) | command-and-illustrative-output | Preserved in the published block; runnable mapping pending |
| [11](published.md#block-11) | rpc-command | Preserved in the published block; runnable mapping pending |
| [12](published.md#block-12) | published-rpc-output-fragment | Preserved in the published block; runnable mapping pending |
| [13](published.md#block-13) | intentional-failure-test | Preserved in the published block; runnable mapping pending |
| [14](published.md#block-14) | command | Preserved in the published block; runnable mapping pending |
| [15](published.md#block-15) | integration-test | [published source](../../../examples/evm/storage-validation/test/Storage.t.sol) |
| [16](published.md#block-16) | published-rpc-output-fragment | Preserved in the published block; runnable mapping pending |
| [17](published.md#block-17) | deployment-script | [published source](../../../examples/evm/storage-validation/script/DebugStore.sol) |
| [18](published.md#block-18) | command | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/foundry/src/Internals.sol](../../../evm/foundry/src/Internals.sol)
- [evm/foundry/src/Tracing.sol](../../../evm/foundry/src/Tracing.sol)
