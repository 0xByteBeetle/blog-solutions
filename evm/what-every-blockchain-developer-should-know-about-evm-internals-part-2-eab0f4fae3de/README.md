# What Every Blockchain Developer Should Know About EVM Internals – Part 2

[Read the article](https://andreyobruchkov1996.substack.com/p/what-every-blockchain-developer-should-know-about-evm-internals-part-2-eab0f4fae3de).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `calldata/`: [foundry.toml](calldata/foundry.toml), [src/](calldata/src/), [test/](calldata/test/).
- `storage/`: [foundry.toml](storage/foundry.toml), [src/](storage/src/), [test/](storage/test/).
- `workshop/`: [foundry.toml](workshop/foundry.toml), [src/](workshop/src/), [test/](workshop/test/).

These tests need only the installed Foundry toolchain.

### workshop

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd workshop && forge test)
```

### calldata

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.4.25.

```sh
(cd calldata && forge build && forge test)
```

### storage

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.12.

```sh
(cd storage && forge build && forge test)
```

The Solidity 0.4.25 calldata tests retain its legacy behavior: selector-only input to `set(uint256)` is accepted and the missing word is read as zero. The compiler pin is intentional.
