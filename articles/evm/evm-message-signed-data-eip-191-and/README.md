# EVM Message — Signed Data EIP-191 and the Ethereum Message Prefix

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-message-signed-data-eip-191-and) · [Published examples](published.md)

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
| [2](published.md#block-2) | encoding-layout | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | worked-encoding | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | pseudocode | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | program-with-omitted-imports | Preserved in the published block; runnable mapping pending; [original repo variant](../../../examples/evm/transaction-types/personalsign/personalsign.go) |
| [6](published.md#block-6) | published-output | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/go/signing](../../../evm/go/signing)
