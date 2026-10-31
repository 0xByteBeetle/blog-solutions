# EVM Tx — Blob Transactions EIP-4844 (Type 0x03) and the First Step Toward Data Sharding

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-tx-blob-transactions-eip-4844).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

### transaction-types

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd transaction-types
go test -run '^$' ./...
```

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The command above compiles only. Use the explicit supplemental local route below for execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.

The blob example resolves `./trusted_setup.txt` from its working directory (`transaction-types/eip4844`). The setup file is required for that example, not for other transaction articles.

## Execute the offline fixture

```sh
cd transaction-types
go run ./offline
go test ./...
```

Creates one canonical zero-high-byte field payload, computes/verifies a real KZG commitment/proof with geth’s bundled Go backend/setup, builds the versioned SHA-256 hash and signs a type-0x03 BlobTx. Tests reject tampered blobs/noncanonical scalars, separate the sidecar wrapper from core transaction bytes/hash, round-trip fields and recover the signer. The original c-kzg setup-file path is not used by this route. Offline proof/serialization success is **not consensus, mempool or network acceptance**.

This supplemental route uses only deterministic, publicly known **NEVER-FUND** fixture keys in memory (integer 1, and integer 2 where needed). It does not call `account.GetAccount`, read/write key files, connect to RPC or broadcast. Original programs and dependency pins remain unchanged. [Primary EIP specification](https://eips.ethereum.org/EIPS/eip-4844).

## Query, send and inspect an owned-local receipt

This supplemental adapter requires installed Anvil/Foundry **1.4.4**, the pinned Go dependencies. It accepts no RPC URL or wallet argument. Run from this article:

```sh
cd transaction-types
go run ./local                 # plan only
go run ./local --execute-local
```

It starts and awaits cleanup of its own loopback Cancun Anvil (chain 31337), checks its chain/fork/client before any mutation, and uses only public **NEVER-FUND** integer fixture keys 1/2. Success, errors and handled SIGINT/SIGTERM terminate and await only the owned child. No default wallet, original account helper or public endpoint is used. Local acceptance is separate from offline signing/KZG checks and does not establish public-chain consensus or mempool acceptance.

The blob route queries the pending nonce, five-block fee history, suggested tip and gas estimate; retains the printed recipient, **10^14 wei**, empty calldata and **2,000,000 wei blob fee cap**. It packs the article’s complete text into canonical zero-high-byte field elements (a labeled correction to raw byte copying), reconstructs that text, computes/verifies a real KZG proof with geth’s bundled Go setup, then signs/submits a type-3 sidecar. Checks require successful type-3 receipt, value/nonce effects, the versioned hash, **131,072 blob gas used**, and positive blob gas price within its cap. BlobGasUsed is not ExcessBlobGas. This local execution does not test beacon availability or historical public receipts.
