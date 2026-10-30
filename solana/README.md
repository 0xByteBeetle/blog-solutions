# Solana article-local code companions

Each of the sixteen published articles has its own folder, setup, manifests,
source excerpts and relevant implementations. Start with that folder's
`SETUP.md`; no sibling article supplies an essential source dependency.

[Source alignment](../verification/solana-alignment-2026-10-30.md) and
[live freshness](../verification/live-source-freshness-2026-10-30.json) cover
16 articles / 156 exact displayed blocks. Source matching is not runtime coverage.

## Fresh local-validator evidence

The [October 30 runtime report](../verification/solana-local-validator-2026-10-30.md)
records selected original/variant programs on disposable local fixtures:
17 integration assertions/tests, seven fundamentals host tests, and the original
wallet build/type checks. The corrected wallet six-check suite passed twice after
removing its three-retry submission cap; confirmed preflight, minimum context
slot and blockheight confirmation remain enabled. Original cold-ALT failure and
the failed capped attempts remain archived separately. No original client was
silently changed. Historical evidence paths describe the actual pre-migration run,
not a new run of the relocated folders.

The six supplemental gap companions now include 33 static/fixture/guard checks.
Their new Solana runtime paths still require validation. Confidential transfers
remain explicitly blocked on a proven compatible proof-enabled local runtime;
installed `spl-token 5.5.0` alone does not establish that compatibility. The staged
CLI workshop reference pins are not a claim that they are installed or verified.
Metadata clients are type-checked only, not broadcast to a public network.

## Runtime setup and safety

Use the article-local pinned npm dependencies, not another article's node_modules.
Anchor **0.31.1**, Rust/Cargo, Solana CLI/keygen, `cargo-build-sbf` and validator are
required for the existing Anchor harnesses. The recorded Mac runtime used Node
**22.6.0** with `NODE_OPTIONS=--experimental-require-module`: a pinned CommonJS
Web3 dependency loads an ESM UUID package. Without that compatibility flag on
that Node version, `ERR_REQUIRE_ESM` may surface as an unknown `.ts` extension.
No universal compatibility with other Node versions is claimed. Initial restores
need registry/network access; optional native bigint bindings may fall back to JS.

Do not run recovered Anchor.toml files or historical clients directly: some name
devnet and personal-wallet paths. Article harnesses copy projects, create disposable
local keys/program IDs and use test-owned local validators. **Even --build-only
creates disposable program/wallet keys.** No personal wallet or public funds are
needed. Preserve original source and keep scaffolding/corrected variants explicit.

Agave 3.1.9 listener inspection showed the temporary RPC and faucet binding all
interfaces despite the configured loopback bind. Tests use the loopback endpoint,
but binding is not a firewall guarantee. Run in an appropriately isolated environment,
keep only disposable state, stop owned processes and remove wallet/program/ledger
keys afterward. Coordinate ports 19899–19902 and range19903–20000; run sequentially.

## Selected original/variant entry points

These root wrappers dispatch to article-local harnesses. First restore dependencies
from the corresponding article's SETUP.md. Commands create local test keys/services
unless explicitly host-only; they do not constitute permission to use public chains.

| Article folder | Original/variant command from repo root | Scope |
| --- | --- | --- |
| `architecting-high-performance-solana` | `node scripts/run-original-anchor.mjs zero-copy-original` (or `zero-copy`) | Each recorded local test passes; layout assertions are separate host checks. |
| `solana-deep-dive-unpacking-borsh` | `node scripts/run-original-anchor.mjs borsh-profile` (or `borsh-proposal`) | Recorded original local tests pass; additional allocation host assertions are distinct. |
| `understanding-solana-part-3-anchor` | `node scripts/run-original-anchor.mjs anchor-accounts` | Three original local tests pass, but they log results rather than comprehensive state/security assertions. |
| `transfer-hooks-on-solana-anchor-031` | `node scripts/run-original-anchor.mjs transfer-hook-original --regression` | Two strengthened balance/rejection checks passed; exact printed workspace is a distinct supplemental route. |
| `understanding-solana-part-6-transactions` | `node scripts/run-original-anchor.mjs wallet-token-balances-original --regression --alt-ready` | Six checks pass for the explicit corrected variant; original cold-ALT failure remains. |
| `where-token-metadata-lives-on-solana` | See article-local project README | Type-check only; do not execute historical public-network client by default. |

`node scripts/verify-additional-companions.mjs` runs offline/loopback EVM tests and
Solana static fixtures, **not** the new Solana CLI/validator workshops. Conceptual
articles are labeled accordingly; no invented standalone program is needed merely
to give every article a folder.
