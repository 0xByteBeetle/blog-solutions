# Wallet token balances: original project

Recovered from Andrey's `~/solana/wallet_tokens_balance` folder. The source files are unchanged and their hashes are recorded in the repository source manifest. No original wallet, keypair, `alt.json`, or deployment artifact was copied.

The Rust program matches [published block 1](../../../articles/solana/understanding-solana-part-6-transactions/published.md#block-1) after replacing the deployment ID and ignoring whitespace. `scripts/create_alts.ts` matches published block 4 after whitespace normalization. Both `ensureAltHasAddresses` and `decodeBalances` are present in the original client: they do not need invented replacements.

## Check the existing code

From the repository root:

```sh
npm ci --prefix solana/anchor --ignore-scripts
node scripts/run-original-anchor.mjs wallet-token-balances-original --build-only
```

This uses a temporary copy, fresh throwaway program IDs, and the shared test dependencies to build the original program and type-check `scripts/client.ts` and `scripts/create_alts.ts`. It does not deploy to devnet, touch a personal wallet, execute the stale scaffold test, or claim successful transaction execution. Anchor 0.31.1 and the Solana build toolchain are required.

## Run with local fixtures

```sh
node scripts/run-original-anchor.mjs wallet-token-balances-original --regression --prepared-alt
```

This separate fixture creates disposable classic and Token-2022 mints, their token accounts, known balances, and a finalized lookup table. It calls the author's unchanged `getBalancesClient` and decoder. Two local tests passed: exact raw balances of `123000000` and `456000000` were returned in a v0 transaction using the ALT, and a mint with no associated token account returned zero.

The fixture suppresses only the historical demo's automatic entrypoint in a temporary client copy. A temporary ALT creator selects a finalized recent slot instead of confirmed. The generated IDL also receives a crate-name alias for Anchor's log reader, only in the temporary build directory. The original files remain unchanged. See the [recorded prepared-ALT result](../../../verification/wallet-token-balances-original-regression-prepared-alt.json).

The empty-ALT path is a separate check:

```sh
node scripts/run-original-anchor.mjs wallet-token-balances-original --regression
```

That run failed after the client extended the ALT and immediately used it: `Transaction address table lookup uses an invalid index`. The passing prepared-table tests do not verify this timing-sensitive path. See [findings](../../../verification/REVIEW-FINDINGS.md); a client readiness change requires the author's decision.

## Setup details and original project limitations

1. Build the program to generate its IDL and client types. The Rust module/IDL name is `wallet_token_balances`; the crate and original build artifact are named `wallet_tokens_balance`. The original client uses the IDL name; do not rename the Rust code to make these strings look uniform.
2. Deploy to an explicitly chosen test environment, using a disposable funded test wallet. The original `Anchor.toml` targets devnet and references the author's personal wallet path, so it is preserved for provenance, not an instruction to use that wallet.
3. Create or supply a classic SPL Token mint and a Token-2022 mint, along with the querying wallet's associated token accounts and known balances. The client does not create or fund these fixtures. With no matching token accounts, the program returns zero, which is not evidence that nonzero balances work.
4. Run the original ALT creation script with that test provider. It writes a new lookup-table address to `alt.json`. The current client does not read that file; its hardcoded `altPubkey` must be supplied from the same test setup. The wallet must control the ALT if extension is necessary.
5. Supply the mint addresses from that same environment in place of the client's two historical mint constants. Confirm the provider, deployment ID, mints, and ALT all refer to the same cluster.
6. Use the separate regression above for known balances, a missing ATA, and returned-data decoding. The original `tests/wallet_tokens_balance.ts` is scaffold code: its type import uses the crate spelling and it calls `initialize()`, which does not exist in this program. It has been kept unchanged rather than represented as a passing test.

The original folder's `MINTING_GUIDE.md` also refers to `scripts/mint-token.ts`, but that file was not present. That guide was not copied as an executable setup recipe.

No missing core Rust/helper implementation has been identified. Prepared-ALT transaction execution and returned balances are now runtime-tested. Cold ALT extension remains a recorded failure, not a completed check.
