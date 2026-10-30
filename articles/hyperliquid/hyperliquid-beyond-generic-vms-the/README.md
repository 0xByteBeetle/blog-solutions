# Hyperliquid: Beyond Generic VMs: The Architecture Internals Part 1

[Read the article](https://andreyobruchkov1996.substack.com/p/hyperliquid-beyond-generic-vms-the) · [Published examples](published.md)

Live native blocks preserved. Offline tests, SDK checks, public-network execution and article completion remain separate.

Article status: **source-restored**.

## Recovered source

- [examples/hyperliquid/account-shapes](../../../examples/hyperliquid/account-shapes)

  Run: `python3 -m unittest discover -s examples/hyperliquid/account-shapes/tests -v`

## Recorded checks

- [examples/hyperliquid/account-shapes: fixture-tested; Rust host not run](../../../verification/hyperliquid-companions.json) (2026-10-30)

  Checked with: `python3 -m unittest discover -s examples/hyperliquid/account-shapes/tests -v`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | source | [published source](../../../examples/hyperliquid/account-shapes/src/lib.rs) |
| [2](published.md#block-2) | illustrative-action | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.
