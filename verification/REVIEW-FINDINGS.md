# Findings that must not be silently repaired

Original published snapshots and recovered implementation files remain unchanged.

## Wallet balances: empty ALT versus prepared ALT

The original project was found in `~/solana/wallet_tokens_balance`. Its Rust program, ALT helper and return-data decoder are present. No replacement implementation is needed.

The separate local fixture recovered the following execution failures on 6 September 2026:

- The unmodified ALT creator failed on a fresh validator with `8 is not a recent slot`. The test-only copy selects a finalized recent slot. The original `scripts/create_alts.ts` remains unchanged.
- A startup run failed while initializing a classic token mint with `Program is not deployed`. The fixture now waits for a rooted startup slot before creating token accounts.
- After successful fixture/ALT creation, the original client extended the empty table with two addresses and immediately submitted its v0 transaction. Both test calls failed with `Transaction address table lookup uses an invalid index` (0 passing, 2 failing). The client does not wait for the newly appended addresses to become usable before submission.

`--prepared-alt` explicitly pre-populates and finalizes the table in fixture code before calling the unchanged client. Its report is separate from the empty-ALT regression. Passing that mode would verify existing-table use and balance decoding, not establish that the original cold-extension path works reliably.

The first prepared-ALT attempt passed both balance assertions but Anchor still exited with `No such file or directory`. Its [0.31.1 log-stream setup](https://github.com/coral-xyz/anchor/blob/v0.31.1/cli/src/lib.rs#L3423) opens the crate-named IDL, while this project generates the module-named IDL. The runner now builds first and copies the generated IDL under a crate-name alias in the temporary directory before running tests. No original crate, module, or client implementation is renamed. A passing assertion log alone is not treated as a successful overall command.

A client change for lookup-table readiness needs Andrey's approval. Do not turn the failing path into an alleged success by skipping preflight, suppressing the error, or marking the whole article verified.

## Transfer-hook negative assertion

The original test catches its own `assert.fail()` as well as transaction errors, so its success log alone cannot prove rejection. The original test is preserved. The separate regression matches the actual hook error, verifies balances remain unchanged after rejection, then verifies the exact successful transfer balances. See `transfer-hook-original-regression.json` for the runtime result and source hashes.

## ABI selector typo in the displayed explanation

[ABI article, block 3](../articles/evm/abi-encoding-deep-dive-how-solidity/published.md#block-3) prints `0xddd456b3`. A local execution of `cast sig 'store((uint256,string))'` returned `0xddd356b3`, matching the article's block 4 calldata. Also, a selector is the first four bytes of the hash, not the entire hash. `cast keccak 'store((uint256,string))'` returned `0xddd356b3e15db61a9d0b2f433e45c4c4476d545eb8a5bc93957fe660a9e68cf5`.

This is a displayed explanation discrepancy; the preserved Storage contract is not changed.

## Diamond lookup command repeats the old selector

[Diamond article, block 24](../articles/evm/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf/published.md#block-24) makes the same `facetAddress` call twice with `0xd09de08a`, but the second comment expects the newly added facet. Blocks 19 and 23 add/map `decrement()` to `0x2baeceb7`. Local `cast sig` checks returned `0xd09de08a` for `increment()` and `0x2baeceb7` for `decrement()`.

The second inspection command should query the new selector if its purpose is to inspect the new facet. The publication snapshot has not been edited.

## Incomplete and illustrative blocks

The `eth_call` example in block 4 of both node-debugging articles ends inside the JSON request and is not a complete runnable command. Other articles intentionally show omitted imports, ellipses, API signatures, pseudocode, or historical output. All 494 blocks are now classified; classification does not claim that every snippet is independently executable or technically verified.
