# Source-preserving blog examples

The author's published blocks and confirmed original repositories are authoritative. Do not invent implementations to fill a missing example, change public APIs or memory layouts, or silently repair a deliberate failure. Ask Andrey when a missing original source or a semantic change needs his decision.

Keep exact published snapshots in each article's `published.md`. Track recovered file provenance and hashes in `catalog/source-files.json`. Setup and test orchestration must be clearly separate from author implementation. Record formatting changes and placeholder substitutions explicitly.

Do not infer article coverage from titles, slugs, or a passing topic-level lab. Preserve original repository variants as variants when they differ from the printed excerpt. Build checks, unit tests, local runtime checks, and public-network execution are separate claims.

Run `node scripts/check-catalog.mjs` and `node --test scripts/source-integrity.test.mjs` after edits. Never update a source hash just to hide an unreviewed implementation change. An unfinished article must remain unfinished in the catalog.

Never copy wallet files, `.key` files, `.env` files, or deployment keypairs from original projects. Do not run published commands blindly: some send transactions, print private keys, use historical contracts, or intentionally fail. Use disposable local wallets and nodes for tests.

Keep working state in this permanent repository, not only in temporary directories. Save a reviewed checkpoint to the authorized feature branch; do not merge into main without approval.
