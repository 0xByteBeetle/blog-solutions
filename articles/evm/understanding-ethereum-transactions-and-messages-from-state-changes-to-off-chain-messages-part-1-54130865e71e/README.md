# Understanding Ethereum Transactions and Messages: From State Changes to Off-Chain Messages — Part 1

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-1-54130865e71e) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Recovered source

- [examples/evm/transaction-types](../../../examples/evm/transaction-types)
- [examples/evm/rlp](../../../examples/evm/rlp)

## Recorded checks

- [examples/evm/rlp: unit-tested](../../../verification/restored-builds.json) (2026-09-06)

  Checked with: `go test ./...`
- [examples/evm/transaction-types: build-checked](../../../verification/restored-builds.json) (2026-09-06)

  Checked with: `go test -run ^$ ./...`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | program-with-omitted-imports | Preserved in the published block; runnable mapping pending |
| [2](published.md#block-2) | program-with-omitted-imports | [published source](../../../examples/evm/rlp/decode/decode.go) |
| [3](published.md#block-3) | program-with-omitted-imports | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | encoding-layout | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | illustrative-data | Preserved in the published block; runnable mapping pending |
| [6](published.md#block-6) | program | [published source](../../../examples/evm/transaction-types/legacy-tx/legacy.go) |
| [7](published.md#block-7) | encoding-layout | Preserved in the published block; runnable mapping pending |
| [8](published.md#block-8) | illustrative-data | Preserved in the published block; runnable mapping pending |
| [9](published.md#block-9) | rpc-command | Preserved in the published block; runnable mapping pending |
| [10](published.md#block-10) | published-rpc-output | Preserved in the published block; runnable mapping pending |
| [11](published.md#block-11) | inspection-command | Preserved in the published block; runnable mapping pending |
| [12](published.md#block-12) | program-with-omitted-imports | Preserved in the published block; runnable mapping pending |
| [13](published.md#block-13) | encoding-layout | Preserved in the published block; runnable mapping pending |
| [14](published.md#block-14) | illustrative-data | Preserved in the published block; runnable mapping pending |
| [15](published.md#block-15) | formula | Preserved in the published block; runnable mapping pending |
| [16](published.md#block-16) | rpc-command | Preserved in the published block; runnable mapping pending |
| [17](published.md#block-17) | published-rpc-output-fragment | Preserved in the published block; runnable mapping pending |
| [18](published.md#block-18) | program-with-omitted-imports | Preserved in the published block; runnable mapping pending |
| [19](published.md#block-19) | encoding-layout | Preserved in the published block; runnable mapping pending |
| [20](published.md#block-20) | encoding-layout | Preserved in the published block; runnable mapping pending |
| [21](published.md#block-21) | worked-encoding | Preserved in the published block; runnable mapping pending |
| [22](published.md#block-22) | pseudocode | Preserved in the published block; runnable mapping pending |
| [23](published.md#block-23) | program-with-omitted-imports | Preserved in the published block; runnable mapping pending |
| [24](published.md#block-24) | published-output | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/go/transactions](../../../evm/go/transactions)
- [evm/go/signing](../../../evm/go/signing)
