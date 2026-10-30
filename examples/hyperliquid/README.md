# Hyperliquid code companions

Five published articles are identified in the October 29, 2026 inventory. Exact
code-block restoration is pending faithful HTML/original files; the historical
text export loses indentation and generic syntax. No full blog prose is stored.

| Article | Source/code stage | Verified here |
| --- | --- | --- |
| [Part 1: architecture](https://andreyobruchkov1996.substack.com/p/hyperliquid-beyond-generic-vms-the) | Rust data-shape blocks await faithful extraction | Not run |
| [Part 2: accounting/trading](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-2-hyperbft) | API request/response examples await faithful extraction | Not run |
| [Part 3: precompiles/CoreWriter](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-3-hyperevm) | Solidity wrappers and intentional failure await faithful extraction | Not run; ordinary Anvil is not HyperCore |
| [Part 4: HIP-3](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-4-hip) | [Linked original repository recovered](hip3-original/README.md); exact displayed-block matching still pending | 10 supplemental offline unit tests; no SDK/network/signing |
| [Part 5: agents/signatures/nonces](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-5-agent) | Three Python files need original indentation/block boundaries | Not run |

Original-repository variants are not silently presented as exact excerpts. Added
setup, tests and corrected wrappers are labeled separately. Do not reconstruct
missing published code by guessing from prose or claim local mocks prove native
HyperCore behavior. No funds or wallets are needed for the verified Part 4 offline
stage. Public API reads, local signing, transaction submission and state confirmation
are distinct later verification stages, not automatic consequences of a build pass.
