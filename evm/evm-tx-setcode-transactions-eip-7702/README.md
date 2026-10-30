# EVM Tx — SetCode Transactions EIP-7702 Temporary Smart-Account Power for EOAs Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-tx-setcode-transactions-eip-7702).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `delegation/`: [foundry.toml](delegation/foundry.toml), [src/](delegation/src/), [test/](delegation/test/).

These tests need only the installed Foundry toolchain.

### delegation

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd delegation && forge build && forge test)
```

### transaction-types

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
(cd transaction-types && go test -run '^$' ./...)
```

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The command above compiles only. Use a separately reviewed disposable local setup before execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.

Delegation tests use synthetic designation bytes to exercise routing, event callers and rejection paths. They do not submit a signed EIP-7702 authorization transaction.
