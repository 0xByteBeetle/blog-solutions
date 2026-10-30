# Hyperliquid code companions

All five published articles' **79 native blocks** were captured from live rendered
pages on October 30, 2026, preserving text, indentation, brackets, placeholders and
order. See [article index](../../ARTICLES.md) and per-article source maps. Full blog
prose and screenshots are not duplicated. Displayed outputs remain historical
observations, not fabricated or current responses.

| Article | Companion / source stage | Verification boundary |
| --- | --- | --- |
| [Part 1: architecture](https://andreyobruchkov1996.substack.com/p/hyperliquid-beyond-generic-vms-the) | [Exact Rust account shapes](account-shapes/README.md) plus supplemental Cargo setup | Python fixture checks pass; Rust host tests await execution. Approval JSON is illustrative, not submitted. |
| [Part 2: accounting/trading](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-2-hyperbft) | [Exact response excerpts](account-shapes/README.md) | Complete clearinghouse JSON validated; spot excerpt retains literal ellipsis and is intentionally not valid complete JSON. No API/trade/UI execution. |
| [Part 3: precompiles/CoreWriter](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-3-hyperevm) | [12 literal block mappings, 11 Solidity files](precompiles-corewriter/README.md) | Build + 10 mocked local tests pass. Ordinary VM mocks do not implement native HyperCore or asynchronous execution. |
| [Part 4: HIP-3](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-4-hip) | [11 exact excerpts](hip3-published/README.md) and [separate linked original project](hip3-original/README.md) | 8 excerpt offline/mock tests + 10 original-builder tests pass. Credential/submission snippets and live preflight not run. |
| [Part 5: agents/signatures/nonces](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-5-agent) | [Three exact Python programs](signing-nonces/README.md), SDK0.24.0 and isolated dependency lock | All programs executed offline and 5 supplemental tests pass. Public fixture keys only; never fund. No approval/submission or server-acceptance claim. |

`node scripts/check-hyperliquid-alignment.mjs` verifies **29 literal source links**
without whitespace normalization; source hashes are additionally enforced by the
catalog checker. The other 50 blocks include commands, illustrative types/intents,
outputs and diagrams—not 50 fabricated replacement programs. TypeScript HIP-3
union fragments are preserved but intentionally not claimed to type-check without
the omitted referenced types. The small `Account.create()` fragment is not run:
new random keys are unnecessary for the published deterministic offline examples.

Original-repository variants are not exact-excerpt substitutes. Added setup/tests
and finite-price wrappers are labeled separately. Public API reads, local signing,
transaction submission and state confirmation are distinct stages. No funded
wallets or public transactions were needed for the completed checks.
