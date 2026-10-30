# Unpacking Hyperliquid Part 3: HyperEVM Precompiles, CoreWriter, and the Solidity Bridge to HyperCore

[Read the article](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-3-hyperevm) · [Published examples](published.md)

Live native blocks preserved. Offline tests, SDK checks, public-network execution and article completion remain separate.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [hyperliquid/unpacking-hyperliquid-part-3-hyperevm/projects/precompiles-corewriter](projects/precompiles-corewriter)

  Run: `forge test --root hyperliquid/unpacking-hyperliquid-part-3-hyperevm/projects/precompiles-corewriter`

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | address-map | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [2](published.md#block-2) | source | [published source](projects/precompiles-corewriter/src/WrongOracle.sol) |
| [3](published.md#block-3) | source | [published source](projects/precompiles-corewriter/src/HyperCoreRead.sol) |
| [4](published.md#block-4) | command | Reference/command/output preserved; no standalone program implied |
| [5](published.md#block-5) | published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [6](published.md#block-6) | published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [7](published.md#block-7) | command | Reference/command/output preserved; no standalone program implied |
| [8](published.md#block-8) | source | [published source](projects/precompiles-corewriter/src/Bbo.sol) |
| [9](published.md#block-9) | command | Reference/command/output preserved; no standalone program implied |
| [10](published.md#block-10) | published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [11](published.md#block-11) | numeric-decoding | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [12](published.md#block-12) | numeric-decoding | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [13](published.md#block-13) | source | [published source](projects/precompiles-corewriter/src/HyperCoreBbo.sol) |
| [14](published.md#block-14) | source | [published source](projects/precompiles-corewriter/src/SpotBalance.sol) |
| [15](published.md#block-15) | source | [published source](projects/precompiles-corewriter/src/HyperCoreBalances.sol) |
| [16](published.md#block-16) | source | [published source](projects/precompiles-corewriter/src/Position.sol) |
| [17](published.md#block-17) | notation | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [18](published.md#block-18) | source | [published source](projects/precompiles-corewriter/src/AccountMarginSummary.sol) |
| [19](published.md#block-19) | source | [published source](projects/precompiles-corewriter/src/UsdClassTransfer.sol) |
| [20](published.md#block-20) | byte-layout | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [21](published.md#block-21) | byte-layout | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [22](published.md#block-22) | source | [published source](projects/precompiles-corewriter/src/UsdClassTransfer.sol) |
| [23](published.md#block-23) | type-notation | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [24](published.md#block-24) | source | [published source](projects/precompiles-corewriter/src/HyperCoreLimitOrder.sol) |
| [25](published.md#block-25) | execution-notation | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [26](published.md#block-26) | execution-notation | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [27](published.md#block-27) | source | [published source](projects/precompiles-corewriter/src/PriceScale.sol) |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.
