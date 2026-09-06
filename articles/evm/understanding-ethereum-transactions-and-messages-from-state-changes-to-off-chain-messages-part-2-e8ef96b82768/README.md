# Understanding Ethereum Transactions and Messages: From State Changes to Off-Chain Messages — Part 2

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-2-e8ef96b82768) · [Published examples](published.md)

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
| [2](published.md#block-2) | program-with-omitted-imports | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | encoding-layout | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | encoding-layout | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | encoding-layout | Preserved in the published block; runnable mapping pending |
| [6](published.md#block-6) | program | [published source](../../../examples/evm/transaction-types/eip7702/invoked.sol), [published source](../../../examples/evm/delegation/src/Invoked.sol) |
| [7](published.md#block-7) | program | [published source](../../../examples/evm/transaction-types/eip7702/multi_delegation_invoker.sol), [published source](../../../examples/evm/delegation/src/MultiDelegationInvoker.sol) |
| [8](published.md#block-8) | instruction-fragment | Preserved in the published block; runnable mapping pending |
| [9](published.md#block-9) | instruction-fragment | Preserved in the published block; runnable mapping pending |
| [10](published.md#block-10) | instruction-fragment | Preserved in the published block; runnable mapping pending |
| [11](published.md#block-11) | instruction-fragment | Preserved in the published block; runnable mapping pending |
| [12](published.md#block-12) | instruction-fragment | Preserved in the published block; runnable mapping pending |
| [13](published.md#block-13) | program | [published source](../../../examples/evm/transaction-types/eip7702/eip7702_batch.go) |
| [14](published.md#block-14) | transaction-fragment | Preserved in the published block; runnable mapping pending |
| [15](published.md#block-15) | struct-fragment | Preserved in the published block; runnable mapping pending |
| [16](published.md#block-16) | pseudocode | Preserved in the published block; runnable mapping pending |
| [17](published.md#block-17) | program | [published source](../../../examples/evm/transaction-types/eip712/verifier.sol), [published source](../../../examples/evm/permit-verifier/src/PermitVerifier.sol) |
| [18](published.md#block-18) | program-with-omitted-imports | Preserved in the published block; runnable mapping pending |
| [19](published.md#block-19) | illustrative-output | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/go/transactions](../../../evm/go/transactions)
- [evm/go/signing](../../../evm/go/signing)
