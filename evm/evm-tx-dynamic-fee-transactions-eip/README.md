# EVM Tx — Dynamic Fee Transactions EIP-1559 (Type 0x02) Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-tx-dynamic-fee-transactions-eip).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

### transaction-types

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd transaction-types
go test -run '^$' ./...
```

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The command above compiles only. Use a separately reviewed disposable local setup before execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.
