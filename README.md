# 0xByteBeetle Blog Examples

Source code accompanying [Andrey Obruchkov's writing](https://andreyobruchkov1996.substack.com).

Start with the [article index](ARTICLES.md). Each article has its published code blocks, recovered original sources where available, and an explicit verification status.

The repository is undergoing a source-preserving repair. All 53 cataloged posts and 494 displayed code/output blocks are preserved. This does **not** mean all 53 articles are runnable or verified yet. Previously, topic-level labs were incorrectly presented as complete coverage of the articles.

See [remaining review and source gaps](verification/REMAINING.md) for the current boundary, including the missing original Solana Part 6 project and the transfer-hook test issue.

- `articles/`: source snapshots and per-article maps.
- `examples/`: recovered author programs and projects. Their origins and any formatting/setup changes are recorded in `catalog/source-files.json`.
- `verification/`: actual build/runtime results, kept separate from source recovery.
- `evm/` and `solana/`: older supplementary labs. They are not authoritative implementations of the posts.

## Check and run

Verify that published blocks and recovered files have not drifted:

```sh
node scripts/check-catalog.mjs
```

Install pinned reproduction libraries before running the Solidity checks. Node.js 22+, Go, Rust, and Foundry must already be installed:

```sh
node scripts/setup-restored.mjs
node scripts/verify-restored-builds.mjs
```

Library versions are reproduction setup, not asserted to be the versions used when the articles were first published. Build-only results are not transaction-execution results.

Run the original RLP implementation and its original tests:

```sh
cd examples/evm/rlp
go test ./...
```

Run recovered factory, clone, UUPS, transparent-proxy, storage, and diamond contracts on a disposable local Anvil node:

```sh
node scripts/verify-restored-evm.mjs
```

Run recovered Anchor projects with a temporary wallet, program IDs, and local validator:

```sh
npm ci --prefix solana/anchor
node scripts/run-original-anchor.mjs zero-copy-original
node scripts/run-original-anchor.mjs borsh-proposal
node scripts/run-original-anchor.mjs anchor-accounts
```

The runner changes only the temporary environment, not the committed program or test bodies. The local Zero-Copy project's original crate name is `borsh_deep_dive`; it is deliberately preserved and documented rather than silently renamed.

Do not run network scripts or copy commands blindly. Published examples may contain historic addresses, public RPC endpoints, placeholders, or intentional failures. Original transaction scripts load or generate test keys and may submit transactions; they are not part of the default verification runner. No wallet/key files from original projects are included.

## Source rule

The author's published code and confirmed original files are authoritative. Do not replace them with equivalent-looking implementations, rename APIs, alter memory layouts, or invent missing helpers. Keep required environment repairs explicit. An unresolved dependency or missing helper must remain marked unresolved until its source or an approved change is available.

`node scripts/check-catalog.mjs --complete` intentionally fails while articles remain unfinished. A structural check or a passing supplementary lab must never be reported as complete article verification.
