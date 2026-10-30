# Part 3 — precompiles and CoreWriter

Companion for [the published Part 3](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-3-hyperevm),
using the live rendered code-block capture from 2026-10-30T15:06:34Z.
`source-map.json` identifies each exact article block and SHA-256. Every mapped
published body remains an unchanged contiguous substring in its source file.
Only compiler setup, the block24 interface import, and a library wrapper around
block27's internal helper were added. These additions are supplemental, not
claimed as published author implementation.

## Setup and local verification

Requirements: Foundry (recorded run: see `verification.json`) and Solidity
**0.8.30**. Project has no external Solidity dependencies. EVM target is Cancun.
Foundry may need to obtain the pinned compiler if not cached.

From repository root:

```sh
forge build --root hyperliquid/unpacking-hyperliquid-part-3-hyperevm/projects/precompiles-corewriter
forge test --root hyperliquid/unpacking-hyperliquid-part-3-hyperevm/projects/precompiles-corewriter -vv
```

No RPC URL, wallet, private key, node, deployment or public transaction is used.
Tests use an in-process local VM, mocked read-call responses and a supplemental
recording contract at the CoreWriter address. **This is not native HyperCore
execution, ABI conformance certification, or a network execution simulation.**

## Exact source map

| Block | Source | Role |
| --- | --- | --- |
| 2 | `src/WrongOracle.sol` | Intentional incorrect selector-prefixed interface. Compiles, but does not represent the raw precompile ABI. |
| 3 | `src/HyperCoreRead.sol` | Oracle read library. |
| 8 | `src/Bbo.sol` | Standalone displayed struct. |
| 13 | `src/HyperCoreBbo.sol` | BBO library with its own nested struct. |
| 14 | `src/SpotBalance.sol` | Standalone displayed struct. |
| 15 | `src/HyperCoreBalances.sol` | Spot balance library with nested struct. |
| 16 | `src/Position.sol` | Displayed position struct; compiled, not exercised against a precompile. |
| 18 | `src/AccountMarginSummary.sol` | Displayed summary struct; compiled, not exercised against a precompile. |
| 19,22 | `src/UsdClassTransfer.sol` | Repeated interface and USD-class action helper. |
| 24 | `src/HyperCoreLimitOrder.sol` | Low-level limit-order helper; imports the interface above. |
| 27 | `src/PriceScale.sol` | Exact internal helper inside supplemental library wrapper. |

Commands, historical responses, layouts and explanatory fragments in the remaining
article blocks stay in the parent's published snapshot. We did not execute their
public RPC requests or present their observed values as fresh results.

## What the ten supplemental tests establish

- Local oracle/BBO/balance wrappers issue expected raw ABI input and decode mocked
  integer/tuple results; oracle malformed output and three call-failure paths reject.
- The intentionally wrong interface prefixes a four-byte selector: 32-byte raw
  index input differs from 36-byte selector-prefixed input. Its rejection is a
  **test fixture**, not a new observation from a native precompile.
- Price helper produces expected 18-decimal values at szDecimals 0, 5, 6, handles zero
  and maximum uint64, and reverts on szDecimals 7 due to checked underflow.
- USD-class action is 68 bytes, with version/action header `01000007` and two ABI
  fields. Limit order is 228 bytes, with header `01000001` and all seven fields.
- The recording writer observes the helper contract as msg.sender, not its caller.
- Zero size/price and tif 255 pass the original local order helper without policy
  checks. This is intentional low-level behavior described by the article, not
  evidence that HyperCore will accept such an order.

## Limits and unresolved production requirements

No native precompile gas/invalid-index behavior, write scaling, asynchronous
HyperCore validation, account activation/funding, limit-order price/size precision,
or final balance/order change is verified. No production policy was silently
added. CoreWriter's void local call returning does not establish native action
success. Mocked read values are fixtures, not assertions about today's markets.

The helper's intended scaling domain must be supplied by trusted metadata;
`szDecimals > 6` is not handled gracefully by the printed helper. USD-class and
limit-order helpers intentionally expose raw integer inputs without authorization
or validation. Use an explicitly reviewed separate variant if additional policy
is needed; preserve these exact originals.
