# What Every Blockchain Developer Should Know About EVM Internals — Part 3

[Read the article](https://andreyobruchkov1996.substack.com/p/what-every-blockchain-developer-should-know-about-evm-internals-part-3-b6813d964592).

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

## Reproduce the local traces

After `node setup.mjs`, with existing Foundry 1.4.4 and Python 3.10+:

```sh
python3 trace_local.py
```

This supplemental runner starts a fresh owned in-memory Cancun Anvil, deploys the unchanged Storage (Solidity 0.8.30, optimizer disabled), checks code and initial state, and sends raw `debug_traceCall` requests for `(25,"bob")` and `(101,"too much")`. It asserts success `failed=false`, empty return data, CALLDATALOAD/SSTORE and final STOP/RETURN; failure `failed=true`, the complete ABI `Error("Number too large")` return data and final REVERT without SSTORE. `retrieve()` remains `0 / empty` after **both simulations**. A trace of a successful write is not a committed write. The runner also executes the preserved script and expects a nonzero exit with the revert reason, then stops its node.

To explore interactively, start your own local `anvil --hardfork cancun --port 8545` in another terminal, then run:

```sh
forge test --match-test testStoreStruct -vvvvv
forge script script/DebugStore.sol:DebugStore --fork-url http://127.0.0.1:8545 -vvvv
forge script script/DebugStore.sol:DebugStore --fork-url http://127.0.0.1:8545 --debug
```

The script's **actual filename is `DebugStore.sol`**, and its printed input is `101 / bob`, so a nonzero exit and `Number too large` are expected in noninteractive mode. The interactive debugger lets you step through the nested Storage call; press `q` to quit. These commands simulate locally and do not broadcast. Raw trace gas/PC values depend on the pinned compiler, fork and state; the article's historical numbers are not asserted.
