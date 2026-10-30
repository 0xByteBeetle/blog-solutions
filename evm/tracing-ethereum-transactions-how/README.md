# Tracing Ethereum Transactions: How to Read and Understand EVM Execution Step-by-Step

[Read the article](https://andreyobruchkov1996.substack.com/p/tracing-ethereum-transactions-how) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [evm/tracing-ethereum-transactions-how/projects/storage-validation](projects/storage-validation)

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | integration-test | [published source](projects/storage-validation/test/Tracing.t.sol) |
| [2](published.md#block-2) | command | Reference/command/output preserved; no standalone program implied |
| [3](published.md#block-3) | command-and-illustrative-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [4](published.md#block-4) | rpc-command | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [5](published.md#block-5) | published-rpc-output-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [6](published.md#block-6) | intentional-failure-test | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [7](published.md#block-7) | command | Reference/command/output preserved; no standalone program implied |
| [8](published.md#block-8) | integration-test | [published source](projects/storage-validation/test/Storage.t.sol) |
| [9](published.md#block-9) | published-rpc-output-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [10](published.md#block-10) | deployment-script | [published source](projects/storage-validation/script/DebugStore.sol) |
| [11](published.md#block-11) | command | Reference/command/output preserved; no standalone program implied |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/tracing-ethereum-transactions-how/supplementary/foundry/src/Tracing.sol](supplementary/foundry/src/Tracing.sol)
- [evm/tracing-ethereum-transactions-how/supplementary/rpc/run-local.sh](supplementary/rpc/run-local.sh)
- [evm/tracing-ethereum-transactions-how/supplementary/go/rpcbatch](supplementary/go/rpcbatch)
