# EVM Tx — Blob Transactions EIP-4844 (Type 0x03) and the First Step Toward Data Sharding

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-tx-blob-transactions-eip-4844).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

### transaction-types

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd transaction-types
go test -run '^$' ./...
```

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The command above compiles only. Use a separately reviewed disposable local setup before execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.

The blob example resolves `./trusted_setup.txt` from its working directory (`transaction-types/eip4844`). The setup file is required for that example, not for other transaction articles.

## Execute the offline fixture

```sh
cd transaction-types
go run ./offline
go test ./...
```

Creates one canonical zero-high-byte field payload, computes/verifies a real KZG commitment/proof with geth’s bundled Go backend/setup, builds the versioned SHA-256 hash and signs a type-0x03 BlobTx. Tests reject tampered blobs/noncanonical scalars, separate the sidecar wrapper from core transaction bytes/hash, round-trip fields and recover the signer. The original c-kzg setup-file path is not used by this route. Offline proof/serialization success is **not consensus, mempool or network acceptance**.

This supplemental route uses only deterministic, publicly known **NEVER-FUND** fixture keys in memory (integer 1, and integer 2 where needed). It does not call `account.GetAccount`, read/write key files, connect to RPC or broadcast. Original programs and dependency pins remain unchanged. [Primary EIP specification](https://eips.ethereum.org/EIPS/eip-4844).
