# Proxies and Upgradability - UUPS proxy (EIP-1822)

[Read the article](https://andreyobruchkov1996.substack.com/p/proxies-and-upgradability-uups-proxy).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

### uups

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
cd uups
forge build
```

### corrected

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
cd corrected
forge test
```

`uups/` retains the pedagogical original; `corrected/` tests a guarded initialization variant and demonstrates the original reinitialization limitation. Neither is claimed production-audited.
