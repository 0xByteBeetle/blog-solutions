# Tracing Ethereum Transactions: How to Read and Understand EVM Execution Step-by-Step

[Read the article](https://andreyobruchkov1996.substack.com/p/tracing-ethereum-transactions-how).

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

## Follow the reverting script

The actual script is `script/DebugStore.sol` and the contract is `DebugStore`:

```sh
forge script script/DebugStore.sol:DebugStore -vvvv
# Interactive terminal: step through the same local simulation
forge script script/DebugStore.sol:DebugStore --debug
# Noninteractive opcode/source-step capture (write outside the project if preferred)
forge script script/DebugStore.sol:DebugStore --debug --dump /tmp/debug-store-steps.json -vvvv
```

The preserved script deploys `Storage`, then calls `store((101,"bob"))`. The contract rejects numbers above 100, so the normal `-vvvv` run ends with **`Number too large` and a nonzero exit status**. The debugger dump itself exits successfully after saving its steps. This is the expected lesson: inspect the `Storage::store` frame and its `REVERT`, rather than treating this script as a successful deployment. These commands simulate locally; they do not broadcast a transaction or need a wallet/RPC URL.
