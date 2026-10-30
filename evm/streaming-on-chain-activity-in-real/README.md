# Streaming On-Chain Activity in Real Time

[Read the article](https://andreyobruchkov1996.substack.com/p/streaming-on-chain-activity-in-real) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [evm/streaming-on-chain-activity-in-real/projects/streaming](projects/streaming)

## Recorded checks

- [evm/streaming-on-chain-activity-in-real/projects/streaming: build-checked](../../verification/restored-evm-builds.json) (2026-10-30)

  Checked with: `go build -o /workspace/scratch/affe29344bfe/blog-solutions-topology/evm/streaming-on-chain-activity-in-real/projects/streaming/.local/program .`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | program | [published source](projects/streaming/main.go) |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/streaming-on-chain-activity-in-real/supplementary/foundry/src/Observability.sol](supplementary/foundry/src/Observability.sol)
- [evm/streaming-on-chain-activity-in-real/supplementary/go/observability](supplementary/go/observability)
- [evm/streaming-on-chain-activity-in-real/supplementary/go/rpcbatch](supplementary/go/rpcbatch)
