# Understanding Ethereum Transactions and Messages: From State Changes to Off-Chain Messages — Part 1

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-1-54130865e71e).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

### rlp

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd rlp
go test ./...
```

### transaction-types

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd transaction-types
go test -run '^$' ./...
```

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The command above compiles only. Use a separately reviewed disposable local setup before execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.
