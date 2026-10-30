# EVM Developer Tools Explained + Foundry Setup

[Read the article](https://andreyobruchkov1996.substack.com/p/evm-developer-tools-explained-foundry).

This is the article’s small Storage example for exercising the Foundry build/test workflow.

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.


Tested toolchain: Foundry 1.4.4; compiler pinned to 0.8.30.

```sh
# From this article directory
forge test
```

## Foundry project

The runnable project is here: [foundry.toml](foundry.toml), [src/](src/) and [test/](test/). Run `forge build` and `forge test` from this article folder. No repository-root setup is required.

## Anvil → deploy → read back

```sh
python3 deploy_local.py
```

Python 3 plus the same installed Forge, Cast and Anvil are sufficient. This supplemental runner starts its own in-memory Anvil on an unused loopback port, runs `forge create src/Storage.sol:Storage --broadcast --json`, verifies the deployment receipt, compares deployed code with `forge inspect ... deployedBytecode`, stores `(42,"bob")`, and checks the exact `retrieve()` result. It stops only its own Anvil in `finally` and writes no wallet or ledger files.

The signer is the **public Anvil default account 0** supplied by the runner; every Cast/Forge network command has its owned loopback URL explicitly set. No personal wallet or public RPC is used. The fresh account's nonce 0 gives `0x5fbdb2315678afecb367f032d93f642f64180aa3`; this address is a local fixture, not a public deployment. The original guard still rejects numbers above 100.
