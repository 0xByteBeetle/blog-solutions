# Token-2022 local lab

This lab turns the Token and Token-2022 command sequences from the Solana articles into one repeatable local-validator run. It uses only disposable keypairs and a disposable ledger.

## What it proves

- Classic SPL Token mint creation, token accounts, minting, and transfer.
- Metadata pointer plus metadata stored directly on a Token-2022 mint.
- Transfer-fee withholding with a 1% fee.
- Permanent-delegate authority and non-transferable tokens.
- Default-frozen accounts and memo-required recipients.
- Interest-bearing rate initialization and rate checkpoints.
- A separate disposable-devnet flow for confidential deposit, pending-balance application, confidential transfer, and withdrawal.

The transfer-hook program is tested separately in [`../anchor`](../anchor) because a real hook needs an on-chain program and an ExtraAccountMetaList PDA.

## Run it

```bash
./run-local.sh
```

Requirements: Solana CLI, `solana-test-validator`, and `spl-token` CLI 5.5 or a compatible release.

The script checks balances and extension state after each operation. Commands expected to fail, such as a non-transferable transfer or a memo-less transfer into a memo-gated account, are treated as passing only when the local runtime rejects them.

No fixed addresses or expected transaction signatures appear here because each run generates fresh local keypairs.

## Confidential transfers

Confidential-transfer proof programs and Token-2022 must come from a mutually compatible cluster release. The Solana CLI 3.1.9 local validator bundled on the machine used to verify this repository rejected the older `spl-token` deposit encoding, while the legacy 1.18 validator did not include the required proof program. For that reason, the article's complete CLI lifecycle is isolated from the deterministic local suite:

```bash
./run-confidential-devnet.sh
```

This script creates fresh devnet-only keys, requests devnet SOL, and then runs the official explicit-token-account pattern. It does not read or modify the user's normal Solana wallet or CLI configuration. Devnet faucet availability is external, so this script is intentionally not part of the default verification command.
