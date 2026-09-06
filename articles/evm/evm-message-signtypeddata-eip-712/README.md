# EVM Message — SignTypedData EIP-712 Secure Off-Chain Signatures for Real-World Ethereum Apps Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-message-signtypeddata-eip-712) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Recovered source

- [examples/evm/transaction-types](../../../examples/evm/transaction-types)
- [examples/evm/permit-verifier](../../../examples/evm/permit-verifier)

## Recorded checks

- [examples/evm/permit-verifier: build-checked](../../../verification/restored-builds.json) (2026-09-06)

  Checked with: `forge build`
- [examples/evm/transaction-types: build-checked](../../../verification/restored-builds.json) (2026-09-06)

  Checked with: `go test -run ^$ ./...`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | struct-fragment | Preserved in the published block; runnable mapping pending |
| [2](published.md#block-2) | pseudocode | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | program | [published source](../../../examples/evm/permit-verifier/src/PermitVerifier.sol), [published source](../../../examples/evm/transaction-types/eip712/verifier.sol); [original repo variant](../../../examples/evm/transaction-types/eip712/verifier.sol) |
| [4](published.md#block-4) | program-with-omitted-imports | Preserved in the published block; runnable mapping pending; [original repo variant](../../../examples/evm/transaction-types/eip712/eip712.go) |
| [5](published.md#block-5) | illustrative-output | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/go/signing](../../../evm/go/signing)
