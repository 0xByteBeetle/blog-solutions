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
