# Understanding Contract Deployments, Proxies, and CREATE2 — Part 1

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-contract-deployments-proxies-and-create2-part-1-696b0b11f8a5).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

### storage-validation

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
cd storage-validation
forge test
```

### transparent-proxy

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.12.

```sh
cd transparent-proxy
forge build
```
