# Unpacking Hyperliquid Part 5: Agent Wallets, Phantom Signatures, and the Nonce State Machine

[Read the article](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-5-agent) · [Published examples](published.md)

Live native blocks preserved. Offline tests, SDK checks, public-network execution and article completion remain separate.

Article status: **source-restored**.

## Recovered source

- [examples/hyperliquid/signing-nonces](../../../examples/hyperliquid/signing-nonces)

  Run: `cd examples/hyperliquid/signing-nonces && .venv/bin/python -m unittest discover -s tests -v`

## Recorded checks

- [examples/hyperliquid/signing-nonces: offline-tested](../../../verification/hyperliquid-companions.json) (2026-10-30)

  Checked with: `python (isolated SDK0.24.0 env) -m unittest discover -s examples/hyperliquid/signing-nonces/tests -v`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | identity-notation | Preserved in the published block; runnable mapping pending |
| [2](published.md#block-2) | identity-notation | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | identity-notation | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | source-fragment | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | lifecycle-notation | Preserved in the published block; runnable mapping pending |
| [6](published.md#block-6) | signing-notation | Preserved in the published block; runnable mapping pending |
| [7](published.md#block-7) | setup-command | Preserved in the published block; runnable mapping pending |
| [8](published.md#block-8) | complete-source | [published source](../../../examples/hyperliquid/signing-nonces/01_sign_and_recover.py) |
| [9](published.md#block-9) | run-command | Preserved in the published block; runnable mapping pending |
| [10](published.md#block-10) | complete-source | [published source](../../../examples/hyperliquid/signing-nonces/02_signed_preimage_mutations.py) |
| [11](published.md#block-11) | run-command | Preserved in the published block; runnable mapping pending |
| [12](published.md#block-12) | published-output | Preserved in the published block; runnable mapping pending |
| [13](published.md#block-13) | example-error | Preserved in the published block; runnable mapping pending |
| [14](published.md#block-14) | comparison-notation | Preserved in the published block; runnable mapping pending |
| [15](published.md#block-15) | time-window-notation | Preserved in the published block; runnable mapping pending |
| [16](published.md#block-16) | nonce-notation | Preserved in the published block; runnable mapping pending |
| [17](published.md#block-17) | complete-source | [published source](../../../examples/hyperliquid/signing-nonces/03_nonce_allocator.py) |
| [18](published.md#block-18) | run-command | Preserved in the published block; runnable mapping pending |
| [19](published.md#block-19) | architecture-notation | Preserved in the published block; runnable mapping pending |
| [20](published.md#block-20) | illustrative-intent | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.
