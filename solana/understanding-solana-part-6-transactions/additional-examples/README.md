# Exact published wallet-balance/ALT workspace

Supplemental article-local setup staged for
https://andreyobruchkov1996.substack.com/p/understanding-solana-part-6-transactions.
The exact native blocks 1 (Rust program), 4 (ALT setup), and 5 (balance client) are in `published/` with hashes in
`source-inputs.json`. These files are authoritative snapshots, including typography,
placeholders and original absence/presence of final newlines. No full blog prose.

## What is kept separate

- `published/`: exact native article blocks, not rewritten to compile.
- `workspace-template/`: complete original Cargo/config workspace with the already
  cataloged extracted published program/client substituted. Existing cataloged quote
  normalization is retained and recorded in `source-inputs.json`. Placeholder program
  IDs remain until the disposable runtime supplies a generated local program ID.
- `variants/original/`: healthy recovered repository variant, preserved byte-for-byte
  from the input checkout (excluding generated files). It is not falsely called the
  printed program; compare variant differences before selecting a path.
- `runtime-deps/`: article-local copies of the existing locked JavaScript dependency
  set, not symlinks to another article. Anchor0.31.1, web3.js1.98.4, spl-token0.4.14.
- `scripts/` and `tests/`: supplemental orchestration/assertions, adapted from the
  existing audited runner rather than a replacement implementation.

Do not run `workspace-template/Anchor.toml` or `variants/original/Anchor.toml`
directly: preserved configurations may reference devnet or personal wallet paths.
Only the explicit runner rewrites them in a temporary workspace to loopback and a
new disposable wallet. The preserved source trees are never changed by the runner.

## Commands and prerequisites

Static checks (no Solana toolchain, keys, RPC, or wallet):

```sh
node --test tests/staging.test.mjs
node --check scripts/run-local.mjs
```

Prepare article-local Node dependencies separately:

```sh
npm ci --prefix runtime-deps --ignore-scripts
```

**Do not execute local-chain commands until coordinated with the runtime owner.**
Requirements: Node22+, npm, Rust/Cargo, Anchor **0.31.1**, `solana-keygen`, compatible
`solana-test-validator`, `cargo-build-sbf`. Rust dependencies are locked in the
workspace's Cargo.lock. Toolchain compatibility beyond the historical original
project has NOT been validated for this exact-source assembly. Record actual
versions. The runtime requires free loopback RPC19899, gossip19901, faucet19902 and
range19903–20000; run sequentially, never against an existing shared validator.

```sh
# Explicitly authorized disposable-local stage only:
node scripts/run-local.mjs --execute-local --build-only
node scripts/run-local.mjs --execute-local --regression
```

Even `--build-only` generates disposable local signing keys in the inherited harness;
it is not an offline/no-credential command. The runtime refuses a public provider
URL or externally supplied ANCHOR_WALLET before checking tools or generating keys.
It creates keys only in its own temporary directory, never reads the normal wallet,
uses a fixed loopback-only provider, writes evidence under `verification/`, and
removes the temporary workspace afterwards. Do not pass mainnet/devnet endpoints.

## ALT modes are distinct claims

The temporary copy uses the exact extracted balance client, not merely a similar
original-repository file. Its automatic historical-address demo is disabled by an
explicit entrypoint guard; regression callers supply newly prepared local addresses.
The printed ALT setup is copied with the established test-only recent-slot change
`confirmed` → `finalized`, needed by the historical fresh-validator fixture. This
is documented adaptation, not an unchanged-source runtime claim.

- `--regression` exercises the printed cold-extension client; its known readiness
  race may fail. A failure is retained as evidence, not caught as success.
- `--regression --prepared-alt` pre-populates and finalizes fixture entries, testing
  printed client use of an existing ALT; it does not prove cold extension works.
- `--regression --alt-ready` explicitly selects the separately authorized existing
  `client-alt-ready.ts` correction preserved in the template. It is NOT relabeled
  as the printed client. The same exact printed Rust program remains under test.

The generated module IDL is aliased under the original crate name solely for Anchor
log streaming. No Rust module/field layout is rewritten. The original stale scaffold
test calls a nonexistent initializer and is preserved, not selected by this runner.


## Current evidence and remaining gate

On2026-10-30 cloud: **4 static tests passed** (source hashes, self-contained dependency
lock/config, missing-action-ack rejection, public-provider/external-wallet rejection).
`node --check` passed. Tests only exercise failure-before-action guards; no signing
key, validator, wallet read, transaction, SDK network call or dependency install ran.

**NOT RUN:** Cargo/Anchor/SBF build, TypeScript compilation with generated IDL, local
validator regressions, and exact published client execution. Cloud lacks this runtime;
parent's Mac must run the staged companion after path migration is coordinated.
Old original-variant runtime results cannot be promoted to this exact-source route.

## Mac runtime result after migration (2026-10-30)

Both recovered and printed workspaces passed build/client type checks. Each cold-ALT mode reproduced 0 passing / 2 failing invalid-index checks; each prepared-ALT mode passed two checks and each explicitly corrected ALT client passed six checks. The corrected variant is separate from the printed/original client.

The supplemental evidence path was corrected to hash `scripts/run-local.mjs`. The initial failure and strict-build rerun remain recorded. [Full local evidence](../../../verification/mac-topology-validation-2026-10-30.md) keeps printed, original and corrected routes distinct.
