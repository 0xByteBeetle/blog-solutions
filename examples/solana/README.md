# Solana source-preserving run map

Supplemental setup/review notes, 2026-10-30. See the [16-article audit](../../verification/solana-alignment-2026-10-30.md).
Original code, published snapshots, intentional failures and recorded variants are
preserved. This review did not build Solana programs or execute transactions. Metadata client
dependencies were installed with lifecycle scripts disabled and type-checks pass. Historical evidence below is from **2026-09-06**, not rerun today.

## Safe setup boundary

Do not run the recovered `Anchor.toml` configurations directly: some target devnet
and reference personal wallet paths. No wallet/keypair is supplied. Published
clients contain historical program/mint/ALT addresses and may submit transactions.
The supported harness copies a project into a temporary directory, creates new
local keys, substitutes program IDs, and rewrites provider/ports/test launcher.
The originals remain unchanged. No public deployment is required.

Prerequisites: Node 22/npm, Rust/Cargo, Anchor **0.31.1**, Solana CLI/keygen,
`cargo-build-sbf` and local validator. Check actual versions before use. The
original transfer-hook config specifies Solana **3.1.9**, but other projects do
not consistently pin it; record the toolchain rather than claiming universal
compatibility. Rust locks exist for recovered projects, but the supplemental
`borsh-profile` and `zero-copy` workspaces lack Cargo.lock. Shared JS dependencies
are pinned in `solana/anchor/package-lock.json` (including Anchor 0.31.1,
web3.js 1.98.4 and spl-token 0.4.14).

From repository root, after reviewing setup scripts:

```sh
node scripts/check-catalog.mjs
node scripts/check-solana-alignment.mjs
node --test scripts/solana-alignment.test.mjs
node --test scripts/source-integrity.test.mjs
npm ci --prefix solana/anchor --ignore-scripts
```

The Anchor harness uses shared dependencies rather than installing each recovered
package.json. It runs TypeScript tests **transpile-only**, not full type checking,
except explicit wallet-client type checks. It requires free loopback ports 19899,
19901, 19902 and range 19903–20000. It writes verification reports: archive old
reports before a rerun if needed. Run projects sequentially, not on those same
ports concurrently.

## Projects and verification matrix

All commands below run from repository root. `runtime` means historical local
validator evidence, not a security audit or complete article verification.

| Directory | Command / status | Historical coverage and remaining gap |
| --- | --- | --- |
| `metadata-published` | `cd examples/solana/metadata-published && npm ci --ignore-scripts && npm run check` | Fresh type-check pass only; original create client reads a personal wallet and broadcasts to devnet if executed. |
| `anchor-accounts` | `node scripts/run-original-anchor.mjs anchor-accounts` | Runtime recorded. Tests create/update/close but only log signatures; no fetched-state, unauthorized-owner or UTF-8-boundary assertions. |
| `borsh-profile` | `node scripts/run-original-anchor.mjs borsh-profile` | Runtime recorded. Test logs raw bytes; no expected byte-array assertion. Published program-ID placeholder substitution is recorded in manifest. |
| `borsh-proposal` | `node scripts/run-original-anchor.mjs borsh-proposal` | Runtime recorded for fixed fixture; two new host serialization boundary tests are prepared but not yet run. Different original program from profile; preserve both. |
| `zero-copy` | `node scripts/run-original-anchor.mjs zero-copy` | Runtime recorded; volume500 and active1 asserted. Published module name, distinct from recovered original. |
| `zero-copy-original` | `node scripts/run-original-anchor.mjs zero-copy-original` | Runtime recorded; same happy path under original `borsh_deep_dive` module. |
| `zero-copy-layout` | `cargo test --locked --manifest-path examples/solana/zero-copy-layout/Cargo.toml -- --nocapture` | Host unit execution recorded in restored-builds.json. Original test prints layout; four new supplemental assertion tests are prepared but not yet run. Host execution does not establish every SBF ABI layout. |
| `transfer-hook` | Snapshot files only; no workspace/run command | Exact published program/client preserved, including placeholder ID. Original project below is a variant, not interchangeable exact source. |
| `transfer-hook-original` | `node scripts/run-original-anchor.mjs transfer-hook-original --regression` | Separate negative/positive balance regression historically passed. Original catch-all negative test is unsound and preserved. |
| `wallet-token-balances` | Snapshot files only; no workspace/run command | Printed program/setup/client preserved; placeholder program ID and historical inputs are not ready-to-run configuration. |
| `wallet-token-balances-original` | `node scripts/run-original-anchor.mjs wallet-token-balances-original --build-only` | Original Rust build and two client type checks recorded; stale original scaffold test calls nonexistent initialize(). |
| same original project, separate corrected client | `node scripts/run-original-anchor.mjs wallet-token-balances-original --regression --alt-ready` | Historical six-check regression and type check recorded. Explicit timing correction, not exact published client. |

[Historical report index](../../verification/REVIEW-FINDINGS.md): original wallet
empty-ALT run **failed**; prepared-ALT fixture passed but bypasses cold extension;
corrected `client-alt-ready.ts` separately passed. No original failure is erased.
The harness also temporarily guards the historical client's automatic entrypoint,
uses a finalized slot for ALT creation, and aliases generated IDL filenames for
Anchor log streaming. These are documented harness changes, not author code.

## Semantic findings from source review

- **Zero-copy authority:** `UpdateMarket.authority` is a Signer but is not bound
  to the market's creator/stored authority; MarketState stores no authority.
  Any signer can request a volume update. Whether this is intended public demo
  behavior or needs a restricted variant requires an explicit design decision.
  `checked_add(...).unwrap()` panics on overflow rather than returning a chosen
  application error. Existing tests cover neither case.
- **Borsh proposal capacity:** allocation is fixed at `8 + 2 + 6 + 36` for
  `Some(true)`, title `GM`, one voter. Instruction arguments accept arbitrary
  strings/vectors; the fixed fixture does not prove larger values fit. Add
  separate capacity/error tests or an explicitly labeled dynamic-allocation
  variant, not a silent rewrite.
- **Transfer hook trust boundary:** source, mint, destination and owner are
  unchecked AccountInfo inputs, and the demo does not assert a token account's
  transferring-state flag. It currently only limits amount and logs; don't extend
  it into trusted accounting based on the assumption that every invocation came
  through Token-2022. A policy change needs separate validation/tests.
- **Wallet balances:** missing/invalid accounts intentionally collapse to zero;
  that is not a proof a wallet has no assets. It checks ATAs, not every possible
  token account. Existing fixtures validate basic classic/Token-2022 cases, not
  all extension-bearing accounts or unbounded return-data sizes.

These are source-review limitations, not freshly executed exploit tests. No
original implementation or source hash was changed.

## Missing setup versus missing original code

Six articles have concrete example project mappings; ten do not (one has no
displayed code). Many unmapped blocks are commands, outputs, ABI layouts or
upstream excerpts, not missing complete programs. Do not rebuild them from titles.

Two **metadata client programs** from blocks4–5 now have exact extracted source in
[`metadata-published`](metadata-published/README.md), pinned dependencies/lockfile,
and a passing TypeScript no-emit check. They retain original wallet/devnet behavior;
do not execute them unchanged. No public-network outcome is verified. The older
`solana/metadata` lab remains separate, not an exact-source substitute.

The Anchor account article's block3 full program uses a placeholder ID and
smart quotes, while the recovered project has its actual ID/ASCII quotes. It
needs a documented substitution-aware mapping, not an invented implementation.
Token-extension CLI articles need per-command CLI-version, cluster, test-mint,
authority and deliberate-failure setup before runnable coverage can be claimed.

## Separate host-boundary tests added after the source review

These do not change original implementations. At this documentation checkpoint,
execution of the new tests is **not yet verified** (see any later execution report).

- `zero-copy-layout/tests/layout.rs`: four supplemental host tests for size 24,
  alignment 8, field offsets, byte map and zero padding.
- `borsh-proposal/programs/borsh_deep_dive/tests/allocation.rs`: two host tests for
  the 54-byte Borsh fixture layout and dynamic-input sizing boundaries.

Each tests directory has its own README/commands and coverage limits. No wallet
or validator is needed for these host tests, but Rust/Cargo and dependencies are.
They do not prove zero-copy authorization or on-chain account-capacity handling.
