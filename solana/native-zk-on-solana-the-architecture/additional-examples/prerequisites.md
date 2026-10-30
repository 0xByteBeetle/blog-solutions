# Unresolved confidential runtime prerequisite

The CLI syntax can be available while the cluster cannot verify its proofs. The
[official status](https://www.solana-program.com/docs/token-2022/status) requires
an enabled [ZK ElGamal proof program](https://docs.anza.xyz/runtime/zk-elgamal-proof).
The [official CLI lifecycle example](https://github.com/solana-program/token-2022/blob/main/clients/cli/examples/confidential-transfer.sh)
uses explicit source/destination token-account addresses. Existing scenario.sh uses
that account-specific pattern, not the ambiguous mint-only flags in some snapshots.

Before enabling this local entrypoint, the runtime owner must record:
1. Exact Agave/validator, spl-token and Token-2022 build/version identifiers.
2. Proof program enabled and compatible with the CLI proof instruction encoding.
3. An isolated loopback fixture that successfully configures both accounts, deposits,
   applies pending balance, transfers, applies destination balance and withdraws.
4. Actual decoded/published balance checks and failure logs, not just CLI exit0.

Current evidence: compatibility is UNVERIFIED. Historical3.1.9 and1.18 paths failed
for different reasons; this is not proof every current local runtime is unsupported.
A newer official CLI/runtime pairing is a candidate, not a test result. No install,
cluster clone or public-chain fallback is authorized by this README. Parent must
coordinate the existing Mac validation session and review enabling the entrypoint.
Until then `bash run.sh --execute-local` intentionally exits3 after capability checks.
