# Batching Calls Efficiently with Multicall and RPC batch

[Read the article](https://andreyobruchkov1996.substack.com/p/batching-calls-efficiently-with-multicall) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [evm/batching-calls-efficiently-with-multicall/projects/multicall](projects/multicall)

## Recorded checks

- [evm/batching-calls-efficiently-with-multicall/projects/multicall: build-checked](../../verification/restored-evm-builds.json) (2026-10-30)

  Checked with: `go build -o /workspace/scratch/affe29344bfe/blog-solutions-topology/evm/batching-calls-efficiently-with-multicall/projects/multicall/.local/program .`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | program | [published source](projects/multicall/main.go) |
| [2](published.md#block-2) | published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/batching-calls-efficiently-with-multicall/supplementary/foundry/src/Observability.sol](supplementary/foundry/src/Observability.sol)
- [evm/batching-calls-efficiently-with-multicall/supplementary/go/observability](supplementary/go/observability)
- [evm/batching-calls-efficiently-with-multicall/supplementary/go/rpcbatch](supplementary/go/rpcbatch)
