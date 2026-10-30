# ABI encoding: a struct with a dynamic string

Companion to [ABI Encoding Deep Dive](https://andreyobruchkov1996.substack.com/p/abi-encoding-deep-dive-how-solidity).

`src/Storage.sol` is unchanged author source (published block 1). The configuration and tests are supplemental. No npm packages, forge-std, wallet, or RPC is needed.

Requires Foundry and Solidity 0.8.12. From this directory:

```sh
forge test -vv
```

Foundry downloads the pinned compiler on first use if absent. With the compiler already cached, `forge test --offline -vv` requires no network.

Four tests cover the empty initial value, tuple calldata and return encoding/decoding, long/empty strings and uint256 boundaries, and rejection of missing tuple calldata. They execute locally in Foundry's EVM. They do not validate every explanatory/calldata block in the article.

Verified: Foundry 1.4.4, solc 0.8.12; all four tests passed.
