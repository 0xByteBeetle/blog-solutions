# Source audit checkpoint: 6 September 2026

This audit is not complete. The old catalog's blanket verification claims have been removed. The current feature branch preserves 53 cataloged articles, 494 displayed blocks, and 106 recovered source/configuration/data files.

All 494 blocks now have explicit classifications. This is not a completion percentage: many blocks are historical output, commands, data, explanatory fragments, or deliberate failures, and classification is not semantic or runtime verification. Two captured posts have no displayed blocks.

## Checks completed on the recovered files

- Six disposable-Anvil workflows: factory, minimal proxy, UUPS, transparent proxy, ABI storage, and diamond.
- Five original/published Anchor projects on a local validator: profile serialization, proposal serialization, published zero-copy, original zero-copy variant, and original account lifecycle. These execute seven integration tests across the five projects; tests that only log data are not stronger assertions than the author wrote.
- Original RLP unit tests and the published 24-byte Rust layout test.
- Three published Foundry storage tests, including the intended revert.
- Build-only checks for transaction scripts, WebSocket streaming, multicall, signature verifier, delegation contracts, calldata, bytecode, and the diamond deployment script.
- Source-integrity checks plus regression tests that deliberately mutate a source or published snapshot.
- Original wallet-balance client with a separately prepared local ALT: two tests verify classic/Token-2022 balances, actual v0 ALT use, and zero for a missing ATA. Its original empty-ALT failure is preserved.
- Authorized `client-alt-ready.ts` correction: type-checking and six tests pass, including empty-ALT and repeated extension, exact balances, reuse/missing ATA, warm-up polling, timeout and RPC-error handling.
- Original transfer-hook program with separate strengthened assertions: oversized transfer rejection with unchanged balances, then an exact successful transfer.

The JSON files here bind results to source hashes. The two Solidity reproduction configurations that disable Solar linting document the external-library resolution problem; successful compilation is not represented as lint success.

## Original sources or decisions still needed

### Solana Part 6: wallet_token_balances

Resolved the missing source location after Andrey requested a broader home-folder search: `~/solana/wallet_tokens_balance`. Twelve original source/configuration files are preserved; wallets and deployment artifacts were excluded. Fixture creation, address wiring and meaningful separate tests are implemented. Andrey authorized the readiness fix after the original cold-extension failure. The clearly labelled corrected variant now passes from an empty ALT and after a further extension; the original client and its prior results remain unchanged. See `REVIEW-FINDINGS.md` and the correction-specific runtime report. This specific timing issue is resolved in the variant; the broader article audit remains incomplete.

### Transfer-hook negative test

The original test places both the transaction and `assert.fail()` inside the same `try`; the catch handles either failure and prints success. The original remains unchanged. The separately authorized regression now verifies the specific rejection and both token balances, and passes against the recovered original program.

### Public-network transaction examples

The original TransactionTypes programs are build-checked, not network-executed. They use historical deployed addresses, require disposable funded accounts, and their original account helper prints private keys. Never execute them against personal wallets or publish their terminal output without filtering. The trusted setup for the blob example has been restored byte-for-byte from the public original repository.

### Remaining article review

Classification is complete; example-level semantic/source comparison and execution coverage are not. Review the recorded selector and inspection-command discrepancies with Andrey, and continue comparing original variants with printed excerpts. Do not mark an entire article verified just because one project runs. The supplemental `evm/` and `solana/` labs are not authoritative article solutions.

## Resume safely

Work in `/Users/andreyobruchkov/clones/blog-solutions` on `codex/restore-original-blog-examples`. Do not rerun the one-off `.local/restore-blog-sources.mjs` or `.local/add-published-stages.mjs`: they are recovery artifacts and would reset or duplicate mappings. The canonical recovered records are committed in `catalog/` and `articles/`.

Run `node scripts/check-catalog.mjs`, `node --test scripts/source-integrity.test.mjs`, and the relevant reproduction runner after changes. Then regenerate pages with `node scripts/generate-catalog.mjs`. `--complete` must continue to fail until every article's review and evidence are complete. Do not merge this checkpoint into main without approval.
