# EVM Message — SignTypedData EIP-712 Secure Off-Chain Signatures for Real-World Ethereum Apps Explained

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-message-signtypeddata-eip-712).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

Install the dependencies actually imported by these examples (Node.js/npm and Git):

```sh
node setup.mjs
```

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `permit-verifier/`: [foundry.toml](permit-verifier/foundry.toml), [src/](permit-verifier/src/), [test/](permit-verifier/test/).

The Makefile restores only this article’s pinned dependencies through `setup.mjs`. OpenZeppelin is installed inside `permit-verifier/node_modules/` from that project’s package lock.

### permit-verifier

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd permit-verifier && forge build && forge test)
```

### transaction-types

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
(cd transaction-types && go test -run '^$' ./...)
```

**Do not run the transaction/signing entrypoints as tests.** They contain historical network addresses; the original account helper creates key files and prints private keys. The command above compiles only. Use a separately reviewed disposable local setup before execution; never use a funded/personal wallet. Keep the `transaction-types` directory name because the original helper uses it to resolve paths.

The permit tests cover typed-data fields and the verifying-contract domain. The original view helper accepts a correctly signed expired payload and does not consume nonces; those limitations are asserted explicitly.
