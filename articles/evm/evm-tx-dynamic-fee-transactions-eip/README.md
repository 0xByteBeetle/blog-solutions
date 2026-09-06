# EVM Tx — Dynamic Fee Transactions EIP-1559 (Type 0x02) Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-tx-dynamic-fee-transactions-eip) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Recovered source

- [examples/evm/transaction-types](../../../examples/evm/transaction-types)

## Recorded checks

- [examples/evm/transaction-types: build-checked](../../../verification/restored-builds.json) (2026-09-06)

  Checked with: `go test -run ^$ ./...`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | encoding-layout | Preserved in the published block; runnable mapping pending |
| [2](published.md#block-2) | illustrative-data | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | formula | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | rpc-command | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | published-rpc-output-fragment | Preserved in the published block; runnable mapping pending |
| [6](published.md#block-6) | program-with-omitted-imports | Preserved in the published block; runnable mapping pending; [original repo variant](../../../examples/evm/transaction-types/eip1559/eip1559.go) |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/go/transactions](../../../evm/go/transactions)
- [evm/go/signing](../../../evm/go/signing)
