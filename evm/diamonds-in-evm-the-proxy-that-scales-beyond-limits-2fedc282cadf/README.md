# Diamonds in EVM: The Proxy That Scales Beyond Limits

[Read the article](https://andreyobruchkov1996.substack.com/p/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

Install the dependencies actually imported by these examples (Node.js/npm and Git):

```sh
node setup.mjs
```

### workshop

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
cd workshop
forge test
```

### diamond

Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
cd diamond
forge build
```
