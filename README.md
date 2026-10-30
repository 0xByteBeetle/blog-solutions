# 0xByteBeetle Blog Examples

Source code accompanying [Andrey Obruchkov's writing](https://andreyobruchkov1996.substack.com).

Start with the [article index](ARTICLES.md). Each article has its published code blocks, recovered original sources where available, and an explicit verification status.

The repository is undergoing a source-preserving repair. All 58 cataloged posts and 573 displayed code/output blocks are preserved. This does **not** mean all 58 articles are runnable or verified yet. Previously, topic-level labs were incorrectly presented as complete coverage of the articles.

Current chain guides: [EVM](evm/README.md), [Solana](solana/README.md),
[Hyperliquid](hyperliquid/README.md), and separately [Sui unpublished draft companions](sui/README.md). All five Hyperliquid posts now have exact live native blocks captured on October 30,
with offline/mock companions. All 37 EVM and 16 Solana pages were also checked live on October 30: their
494 native blocks match saved text exactly. [Dated evidence](verification/live-source-freshness-2026-10-30.json)
proves source text at that capture time, not technical correctness or execution.

See the current chain guides above for fresh results and remaining gates. The
[September baseline](verification/REMAINING.md) is retained as historical evidence,
including the separately corrected Solana ALT and transfer-hook tests.

[Mac validation after migration](verification/mac-topology-validation-2026-10-30.md) records fresh article-path builds, 27 passing Anchor integration checks, three passing nonconfidential Token-2022 CLI scenarios, and the preserved source failures. Confidential proof execution remains blocked.

## Layout

```text
evm/<article-slug>/
  README.md           # concise source map and scoped verification
  SETUP.md            # local reproduction instructions
  published.md        # exact code/command/output snippets, not blog prose
  projects/<variant>/ # original/published code with its manifests and tests
  supplementary/      # optional older labs, explicitly not author implementations
  additional-examples/# optional supplemental runnable gap companions
solana/<article-slug>/
hyperliquid/<article-slug>/
```

Dependencies are installed within each article. Copying one article directory retains its code, setup, manifests and tests; no sibling article source is required. Shared root scripts only orchestrate these local projects. Author-repository variants stay byte-identical; supplemental runnable configuration and harnesses are labeled separately. Sui drafts are not included in this published-article catalog.

`catalog/project-paths.json` gives canonical representative paths for repository-wide tests; `catalog/topology-migration.json` records all copies of formerly shared projects. Original historical verification reports retain their original paths and dates; they are not relabeled as a new runtime run. Source restoration remains separate from build and execution verification.

## Check and run

Verify that published blocks and recovered files have not drifted:

```sh
node scripts/check-catalog.mjs
node scripts/check-topology.mjs
node --test scripts/topology.test.mjs
node scripts/check-evm-alignment.mjs
node scripts/check-solana-alignment.mjs
node scripts/check-hyperliquid-alignment.mjs
node scripts/check-live-source-freshness.mjs
node --test scripts/source-integrity.test.mjs scripts/evm-alignment.test.mjs scripts/solana-alignment.test.mjs scripts/hyperliquid-alignment.test.mjs scripts/live-source-freshness.test.mjs scripts/toolchain.test.mjs
```

Install pinned reproduction libraries before running the Solidity checks. Node.js 22+, Go, Rust, and Foundry must already be installed:

```sh
node scripts/setup-restored.mjs
node scripts/verify-restored-builds.mjs
```

Library versions are reproduction setup, not asserted to be the versions used when the articles were first published. Build-only results are not transaction-execution results.

Run the original RLP implementation and its original tests:

```sh
cd evm/what-is-recursive-length-prefix-rlp/projects/rlp
go test ./...
```

Run recovered factory, clone, UUPS, transparent-proxy, storage, and diamond contracts on a disposable local Anvil node:

```sh
node scripts/verify-restored-evm.mjs
```

Run recovered Anchor projects with a temporary wallet, program IDs, and local validator:

```sh
# Run one article at a time; see its SETUP.md for installed toolchain prerequisites.
(
  cd solana/architecting-high-performance-solana
  npm ci --ignore-scripts
  node scripts/run-original-anchor.mjs zero-copy-original
)
(
  cd solana/solana-deep-dive-unpacking-borsh
  npm ci --ignore-scripts
  node scripts/run-original-anchor.mjs borsh-proposal
)
(
  cd solana/understanding-solana-part-3-anchor
  npm ci --ignore-scripts
  node scripts/run-original-anchor.mjs anchor-accounts
)
```

The runner changes only the temporary environment, not the committed program or test bodies. The local Zero-Copy project's original crate name is `borsh_deep_dive`; it is deliberately preserved and documented rather than silently renamed.

Do not run network scripts or copy commands blindly. Published examples may contain historic addresses, public RPC endpoints, placeholders, or intentional failures. Original transaction scripts load or generate test keys and may submit transactions; they are not part of the default verification runner. No wallet/key files from original projects are included.

## Source rule

This is a code companion, not a mirror of the blog. Keep full article prose on Substack/Medium. The `<chain>/<article-slug>/published.md` files preserve only displayed code, commands and relevant output with provenance; they are not full article copies. Per-article READMEs describe setup, source mapping and verification limits. Temporary full-text research belongs outside the tracked repository.


The author's published code and confirmed original files are authoritative. Do not replace them with equivalent-looking implementations, rename APIs, alter memory layouts, or invent missing helpers. Keep required environment repairs explicit. An unresolved dependency or missing helper must remain marked unresolved until its source or an approved change is available.

`node scripts/check-catalog.mjs --complete` intentionally fails while articles remain unfinished. A structural check or a passing supplementary lab must never be reported as complete article verification.
