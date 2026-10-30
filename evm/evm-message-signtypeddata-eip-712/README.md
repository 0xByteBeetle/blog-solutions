# EVM Message — SignTypedData EIP-712 Secure Off-Chain Signatures for Real-World Ethereum Apps Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-message-signtypeddata-eip-712) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [evm/evm-message-signtypeddata-eip-712/projects/transaction-types](projects/transaction-types)
- [evm/evm-message-signtypeddata-eip-712/projects/permit-verifier](projects/permit-verifier)

## Recorded checks

- [evm/evm-message-signtypeddata-eip-712/projects/permit-verifier: build-checked](../../verification/restored-evm-builds.json) (2026-10-30)

  Checked with: `forge build`
- [evm/evm-message-signtypeddata-eip-712/projects/transaction-types: build-checked](../../verification/restored-evm-builds.json) (2026-10-30)

  Checked with: `go test -run ^$ ./...`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | struct-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [2](published.md#block-2) | pseudocode | Reference/command/output preserved; no standalone program implied |
| [3](published.md#block-3) | program | [published source](projects/permit-verifier/src/PermitVerifier.sol), [published source](projects/transaction-types/eip712/verifier.sol); [original repo variant](projects/transaction-types/eip712/verifier.sol) |
| [4](published.md#block-4) | program-with-omitted-imports | Preserved excerpt; runnable implementation scope remains to be reviewed; [original repo variant](projects/transaction-types/eip712/eip712.go) |
| [5](published.md#block-5) | illustrative-output | Preserved excerpt; runnable implementation scope remains to be reviewed |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/evm-message-signtypeddata-eip-712/supplementary/go/signing](supplementary/go/signing)
