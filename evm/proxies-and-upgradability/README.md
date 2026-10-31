# Proxies and Upgradability - Transparent Proxy (EIP-1967)

[Read the article](https://andreyobruchkov1996.substack.com/p/proxies-and-upgradability).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.


Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.12.

```sh
# From this article directory
forge build
forge test
```

## Foundry project

The runnable project is here: [foundry.toml](foundry.toml), [src/](src/) and [test/](test/). Run `forge build` and `forge test` from this article folder. No repository-root setup is required.

The supplemental tests also read raw EIP-1967 admin/implementation words with `vm.load` before and after upgrade, checking the unchanged admin and preserved user state.
