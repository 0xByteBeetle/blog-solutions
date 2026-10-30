# Understanding Contract Deployments, Proxies, and CREATE2 — Part 1

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-contract-deployments-proxies-and-create2-part-1-696b0b11f8a5).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `storage-validation/`: [foundry.toml](storage-validation/foundry.toml), [src/](storage-validation/src/), [test/](storage-validation/test/).
- `transparent-proxy/`: [foundry.toml](transparent-proxy/foundry.toml), [src/](transparent-proxy/src/), [test/](transparent-proxy/test/).

These tests need only the installed Foundry toolchain.

### storage-validation

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd storage-validation && forge test)
```

### transparent-proxy

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.12.

```sh
(cd transparent-proxy && forge build && forge test)
```
