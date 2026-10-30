# Diamonds in EVM: The Proxy That Scales Beyond Limits

[Read the article](https://andreyobruchkov1996.substack.com/p/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

Install the dependencies actually imported by these examples (Node.js/npm and Git):

```sh
node setup.mjs
```

## Run the Solidity examples

From this article folder, run `make build` and `make test`. Each nested project keeps its own compiler pin and focused tests:

- `diamond/`: [foundry.toml](diamond/foundry.toml), [src/](diamond/src/), [test/](diamond/test/).
- `workshop/`: [foundry.toml](workshop/foundry.toml), [src/](workshop/src/), [test/](workshop/test/).

The Makefile restores only this article’s pinned dependencies through `setup.mjs`. The deployment script’s pinned forge-std dependency is installed inside `diamond/.local/forge-std/`.

### workshop

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd workshop && forge test)
```

### diamond

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
(cd diamond && forge build && forge test)
```
