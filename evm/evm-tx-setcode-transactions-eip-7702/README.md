# EVM Tx — SetCode Transactions EIP-7702 Temporary Smart-Account Power for EOAs Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-tx-setcode-transactions-eip-7702) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [evm/evm-tx-setcode-transactions-eip-7702/projects/transaction-types](projects/transaction-types)
- [evm/evm-tx-setcode-transactions-eip-7702/projects/delegation](projects/delegation)

## Recorded checks

- [evm/evm-tx-setcode-transactions-eip-7702/projects/delegation: build-checked](../../verification/restored-evm-builds.json) (2026-10-30)

  Checked with: `forge build`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | encoding-layout | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [2](published.md#block-2) | encoding-layout | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [3](published.md#block-3) | encoding-layout | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [4](published.md#block-4) | program | [published source](projects/delegation/src/Invoked.sol), [published source](projects/transaction-types/eip7702/invoked.sol); [original repo variant](projects/transaction-types/eip7702/invoked.sol) |
| [5](published.md#block-5) | program | [published source](projects/delegation/src/MultiDelegationInvoker.sol), [published source](projects/transaction-types/eip7702/multi_delegation_invoker.sol); [original repo variant](projects/transaction-types/eip7702/multi_delegation_invoker.sol) |
| [6](published.md#block-6) | instruction-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [7](published.md#block-7) | instruction-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [8](published.md#block-8) | instruction-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [9](published.md#block-9) | instruction-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [10](published.md#block-10) | instruction-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [11](published.md#block-11) | program | [published source](projects/transaction-types/eip7702/eip7702_batch.go); [original repo variant](projects/transaction-types/eip7702/eip7702_batch.go) |
| [12](published.md#block-12) | transaction-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/evm-tx-setcode-transactions-eip-7702/supplementary/go/transactions](supplementary/go/transactions)
- [evm/evm-tx-setcode-transactions-eip-7702/supplementary/go/signing](supplementary/go/signing)
