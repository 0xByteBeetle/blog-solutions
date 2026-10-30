# Understanding Ethereum Transactions and Messages: From State Changes to Off-Chain Messages — Part 2

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-2-e8ef96b82768).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

Install the dependencies actually imported by these examples (Node.js/npm and Git):

```sh
node setup.mjs
```

### permit-verifier

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
cd permit-verifier
forge build
```

### delegation

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
cd delegation
forge build
```

### transaction-types

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd transaction-types
go test -run '^$' ./...
```

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The command above compiles only. Use a separately reviewed disposable local setup before execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.
