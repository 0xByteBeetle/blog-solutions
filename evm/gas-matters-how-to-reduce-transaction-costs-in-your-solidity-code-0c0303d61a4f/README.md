# Gas Matters: How to Reduce Transaction Costs in Your Solidity Code

[Read the article](https://andreyobruchkov1996.substack.com/p/gas-matters-how-to-reduce-transaction-costs-in-your-solidity-code-0c0303d61a4f).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

Install the dependencies actually imported by these examples (Node.js/npm and Git):

```sh
node setup.mjs
```


Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
# From this article directory
forge test
```

## Foundry project

The runnable project is here: [foundry.toml](foundry.toml), [src/](src/) and [test/](test/). Run `forge build` and `forge test` from this article folder after `node setup.mjs`.
