# Part 3: precompiles and CoreWriter

[Article](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-3-hyperevm)

The source files preserve the printed contract/library bodies. Compiler headers, the interface import in HyperCoreLimitOrder, and a library wrapper around PriceScale are supplemental. WrongOracle is intentionally incorrect and retained for comparison.

Requires Foundry and Solidity 0.8.30 (pinned, Cancun EVM); no external Solidity packages. From this directory:

```sh
forge test -vv
```

Ten supplemental local tests cover ABI call shapes, mock decoding/failures, price-scaling boundaries, and recorded CoreWriter action encoding. No RPC, wallet or deployment is needed. Mocked precompile results and the recording writer are not native HyperCore execution or confirmation of action acceptance.

The original helper reverts for szDecimals > 6; raw order helpers do not enforce market policy. These teaching-scope behaviors are preserved.
