# Proxies and Upgradability - UUPS proxy (EIP-1822)

[Read the article](https://andreyobruchkov1996.substack.com/p/proxies-and-upgradability-uups-proxy).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `corrected/`: [foundry.toml](corrected/foundry.toml), [src/](corrected/src/), [test/](corrected/test/).
- `uups/`: [foundry.toml](uups/foundry.toml), [src/](uups/src/), [test/](uups/test/).

These tests need only the installed Foundry toolchain.

### uups

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd uups && forge build && forge test)
```

### corrected

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd corrected && forge test)
```

`uups/` retains the pedagogical original; `corrected/` tests a guarded initialization variant and demonstrates the original reinitialization limitation. Neither is claimed production-audited.
