# Understanding Contract Deployments, Proxies, and CREATE2 — Part 2

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-contract-deployments-proxies-and-create2-part-2-df8f05998d5e).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `factory/`: [foundry.toml](factory/foundry.toml), [src/](factory/src/), [test/](factory/test/).
- `minimal-proxy/`: [foundry.toml](minimal-proxy/foundry.toml), [src/](minimal-proxy/src/), [test/](minimal-proxy/test/).
- `uups/`: [foundry.toml](uups/foundry.toml), [src/](uups/src/), [test/](uups/test/).

These tests need only the installed Foundry toolchain.

### uups

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd uups && forge build && forge test)
```

### minimal-proxy

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd minimal-proxy && forge build && forge test)
```

### factory

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd factory && forge build && forge test)
```
