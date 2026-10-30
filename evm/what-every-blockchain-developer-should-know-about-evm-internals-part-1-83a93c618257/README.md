# What Every Blockchain Developer Should Know About EVM Internals— Part 1.

[Read the article](https://andreyobruchkov1996.substack.com/p/what-every-blockchain-developer-should-know-about-evm-internals-part-1-83a93c618257).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `bytecode/`: [foundry.toml](bytecode/foundry.toml), [src/](bytecode/src/), [test/](bytecode/test/).
- `workshop/`: [foundry.toml](workshop/foundry.toml), [src/](workshop/src/), [test/](workshop/test/).

These tests need only the installed Foundry toolchain.

### bytecode

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd bytecode && forge build && forge test)
```

### workshop

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd workshop && forge test)
```
