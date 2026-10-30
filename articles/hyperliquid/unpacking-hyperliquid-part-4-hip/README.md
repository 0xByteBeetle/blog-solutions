# Unpacking Hyperliquid Part 4: HIP-3, Builder-Deployed Perpetuals, and the New Market Trust Boundary

[Read the article](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-4-hip) · [Published examples](published.md)

Live native blocks preserved. Offline tests, SDK checks, public-network execution and article completion remain separate.

Article status: **source-restored**.

## Recovered source

- [examples/hyperliquid/hip3-original](../../../examples/hyperliquid/hip3-original)

  Run: `python3 -m unittest discover -s examples/hyperliquid/hip3-original/tests -v`
- [examples/hyperliquid/hip3-published](../../../examples/hyperliquid/hip3-published)

  Run: `python3 -m unittest discover -s examples/hyperliquid/hip3-published/tests -v`

## Recorded checks

- [examples/hyperliquid/hip3-published: offline/mock-tested; blocks8/9not run](../../../verification/hyperliquid-companions.json) (2026-10-30)

  Checked with: `python3 -m unittest discover -s examples/hyperliquid/hip3-published/tests -v`
- [examples/hyperliquid/hip3-original: offline-unit-tested](../../../verification/hyperliquid-hip3-offline.json) (2026-10-30)

  Checked with: `python3 -m unittest discover -s examples/hyperliquid/hip3-original/tests -v`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | lifecycle-notation | Preserved in the published block; runnable mapping pending |
| [2](published.md#block-2) | type-notation | [published source](../../../examples/hyperliquid/hip3-published/published/block-02.ts) |
| [3](published.md#block-3) | type-notation | [published source](../../../examples/hyperliquid/hip3-published/published/block-03.ts) |
| [4](published.md#block-4) | source-fragment | [published source](../../../examples/hyperliquid/hip3-published/published/block-04.py) |
| [5](published.md#block-5) | formula | Preserved in the published block; runnable mapping pending |
| [6](published.md#block-6) | source-fragment | [published source](../../../examples/hyperliquid/hip3-published/published/block-06.py) |
| [7](published.md#block-7) | source-fragment | [published source](../../../examples/hyperliquid/hip3-published/published/block-07.py) |
| [8](published.md#block-8) | source-fragment | [published source](../../../examples/hyperliquid/hip3-published/published/block-08.py) |
| [9](published.md#block-9) | source-fragment | [published source](../../../examples/hyperliquid/hip3-published/published/block-09.py) |
| [10](published.md#block-10) | source-fragment | [published source](../../../examples/hyperliquid/hip3-published/published/block-10.py) |
| [11](published.md#block-11) | source-fragment | [published source](../../../examples/hyperliquid/hip3-published/published/block-11.py) |
| [12](published.md#block-12) | command | Preserved in the published block; runnable mapping pending |
| [13](published.md#block-13) | published-output | Preserved in the published block; runnable mapping pending |
| [14](published.md#block-14) | command | Preserved in the published block; runnable mapping pending |
| [15](published.md#block-15) | published-output | Preserved in the published block; runnable mapping pending |
| [16](published.md#block-16) | published-output | Preserved in the published block; runnable mapping pending |
| [17](published.md#block-17) | command | Preserved in the published block; runnable mapping pending |
| [18](published.md#block-18) | lifecycle-notation | Preserved in the published block; runnable mapping pending |
| [19](published.md#block-19) | type-notation | [published source](../../../examples/hyperliquid/hip3-published/published/block-19.ts) |
| [20](published.md#block-20) | source-fragment | [published source](../../../examples/hyperliquid/hip3-published/published/block-20.py) |
| [21](published.md#block-21) | formula | Preserved in the published block; runnable mapping pending |
| [22](published.md#block-22) | formula | Preserved in the published block; runnable mapping pending |
| [23](published.md#block-23) | namespace-notation | Preserved in the published block; runnable mapping pending |
| [24](published.md#block-24) | formula | Preserved in the published block; runnable mapping pending |
| [25](published.md#block-25) | formula | Preserved in the published block; runnable mapping pending |
| [26](published.md#block-26) | lifecycle-notation | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.
