# What Actually Happens When Calldata Hits the EVM

[Read the article](https://andreyobruchkov1996.substack.com/p/what-actually-happens-when-calldata).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.


Tested toolchain: Foundry 1.4.4; compiler pinned to 0.4.25.

```sh
# From this article directory
forge build
forge test
```

## Foundry project

The runnable project is here: [foundry.toml](foundry.toml), [src/](src/) and [test/](test/). Run `forge build` and `forge test` from this article folder. No repository-root setup is required.

The Solidity 0.4.25 calldata tests retain its legacy behavior: selector-only input to `set(uint256)` is accepted and the missing word is read as zero. The compiler pin is intentional.
