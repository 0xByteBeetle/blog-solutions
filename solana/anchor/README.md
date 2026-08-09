# Anchor labs

This workspace contains four programs used across the Solana articles:

- `accounts` demonstrates PDA derivation, seeds, bumps, ownership constraints, account sizing, updates, and closing.
- `borsh_lab` exposes fixed and dynamic Borsh layouts through raw account bytes.
- `zero_copy` covers explicit padding, `AccountLoader`, direct mutation, and the two-step pattern for accounts larger than 10 KB.
- `transfer_hook` implements the Token-2022 transfer-hook interface and proves both an allowed and a rejected transfer.

Build every program:

```bash
./scripts/build.sh
```

Run the local-validator integration suite:

```bash
./scripts/test.sh
```

The wrappers generate disposable program keypairs under the ignored `target` directory, synchronize the four program IDs for that run, and restore the tracked source files afterward. The generated keys are local-only and must never be funded or used for a public deployment.

The canonical TypeScript interfaces are tracked in `types/`, so a fresh clone can
type-check the tests without relying on an uncommitted Anchor build directory. After
changing an instruction or account schema, refresh them with:

```bash
./scripts/sync-types.sh
```
