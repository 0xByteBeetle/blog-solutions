# Understanding Ethereum Transactions and Messages: From State Changes to Off-Chain Messages — Part 2

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-2-e8ef96b82768).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

Install the dependencies actually imported by these examples (Node.js/npm and Git):

```sh
node setup.mjs
```

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `delegation/`: [foundry.toml](delegation/foundry.toml), [src/](delegation/src/), [test/](delegation/test/).
- `permit-verifier/`: [foundry.toml](permit-verifier/foundry.toml), [src/](permit-verifier/src/), [test/](permit-verifier/test/).

The Makefile restores only this article’s pinned dependencies through `setup.mjs`. OpenZeppelin is installed inside `permit-verifier/node_modules/` from that project’s package lock.

### permit-verifier

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd permit-verifier && forge build && forge test)
```

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

The permit tests cover signature and domain binding, including the original helper’s lack of expiry and nonce consumption. Delegation tests use synthetic designation bytes to exercise the invoker; they do not submit a signed EIP-7702 authorization transaction.

### What the preserved EIP-7702 invoker demonstrates

`MultiDelegationInvoker` reads the `0xef0100 || address` designation and calls the extracted module directly with `someModule.call(...)`. Consequently the module sees **the invoker contract as `msg.sender`**, and emits from the module address. This is not execution through the designated EOA; protocol delegation would execute the target code in the authority account's context. `testDesignationRoutesToModuleAndRecordsInvokerAsSender` checks this distinction explicitly.

Under [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702), the designation is persistent account code until a later authorization replaces or clears it; it is not temporary for one transaction. These tests install synthetic bytes with `vm.etch`. They validate the printed invoker's parsing/call behavior, not SetCode transaction authorization, signature validation, or protocol delegation.
