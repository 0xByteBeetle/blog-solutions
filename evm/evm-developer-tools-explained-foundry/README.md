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
