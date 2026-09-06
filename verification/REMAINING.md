# Source audit checkpoint: 6 September 2026

This audit is not complete. The old catalog's blanket verification claims have been removed. The current feature branch preserves 53 cataloged articles, 494 displayed blocks, and 98 recovered source/configuration/data files.

75 blocks currently have direct recovered-source links. This is not a completion percentage: many of the 494 blocks are historical output, commands, data, explanatory fragments, or deliberate failures. 364 blocks still need explicit classification and review. Two captured posts have no displayed blocks.

## Checks completed on the recovered files

- Six disposable-Anvil workflows: factory, minimal proxy, UUPS, transparent proxy, ABI storage, and diamond.
- Five original/published Anchor projects on a local validator: profile serialization, proposal serialization, published zero-copy, original zero-copy variant, and original account lifecycle. These execute seven integration tests across the five projects; tests that only log data are not stronger assertions than the author wrote.
- Original RLP unit tests and the published 24-byte Rust layout test.
- Three published Foundry storage tests, including the intended revert.
- Build-only checks for transaction scripts, WebSocket streaming, multicall, signature verifier, delegation contracts, calldata, bytecode, and the diamond deployment script.
- Source-integrity checks plus regression tests that deliberately mutate a source or published snapshot.

The JSON files here bind results to source hashes. The two Solidity reproduction configurations that disable Solar linting document the external-library resolution problem; successful compilation is not represented as lint success.

## Original sources or decisions still needed

### Solana Part 6: wallet_token_balances

Resolved the missing source location after Andrey requested a broader home-folder search: `~/solana/wallet_tokens_balance`. Twelve original source/configuration files are now preserved in `examples/solana/wallet-token-balances-original`; wallets and deployment artifacts were excluded. The core program matches the publication apart from ID/whitespace, and the ALT creator matches apart from whitespace. A dedicated README lists the remaining fixture, address wiring, and stale scaffold-test gaps. Keep the original program/client unchanged; the next step is an explicitly separated reproducible test setup.

### Transfer-hook negative test

The local original is `/Users/andreyobruchkov/clones/transfer-hook-project/tests/transfer-hook-project.ts`. Its whale-transfer test places both the transaction and `assert.fail()` inside the same `try`; the catch handles either failure and prints success. Consequently, its success message does not establish that the transfer was rejected. The local original has not been edited. The published program/client are preserved separately. Further work should keep the original test intact and obtain approval for a clearly separated corrected regression test if needed.

### Public-network transaction examples

The original TransactionTypes programs are build-checked, not network-executed. They use historical deployed addresses, require disposable funded accounts, and their original account helper prints private keys. Never execute them against personal wallets or publish their terminal output without filtering. The trusted setup for the blob example has been restored byte-for-byte from the public original repository.

### Remaining article review

Finish per-block classification and compare original repository variants with printed excerpts, recording differences rather than silently merging them. Do not mark an entire article verified just because one project runs. The supplemental `evm/` and `solana/` labs remain available but are not authoritative article solutions.

## Resume safely

Work in `/Users/andreyobruchkov/clones/blog-solutions` on `codex/restore-original-blog-examples`. Do not rerun the one-off `.local/restore-blog-sources.mjs` or `.local/add-published-stages.mjs`: they are recovery artifacts and would reset or duplicate mappings. The canonical recovered records are committed in `catalog/` and `articles/`.

Run `node scripts/check-catalog.mjs`, `node --test scripts/source-integrity.test.mjs`, and the relevant reproduction runner after changes. Then regenerate pages with `node scripts/generate-catalog.mjs`. `--complete` must continue to fail until every article's review and evidence are complete. Do not merge this checkpoint into main without approval.
