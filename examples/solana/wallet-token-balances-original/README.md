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

## What is needed for a reproducible run

1. Build the program to generate its IDL and client types. The Rust module/IDL name is `wallet_token_balances`; the crate and original build artifact are named `wallet_tokens_balance`. The original client uses the IDL name; do not rename the Rust code to make these strings look uniform.
2. Deploy to an explicitly chosen test environment, using a disposable funded test wallet. The original `Anchor.toml` targets devnet and references the author's personal wallet path, so it is preserved for provenance, not an instruction to use that wallet.
3. Create or supply a classic SPL Token mint and a Token-2022 mint, along with the querying wallet's associated token accounts and known balances. The client does not create or fund these fixtures. With no matching token accounts, the program returns zero, which is not evidence that nonzero balances work.
4. Run the original ALT creation script with that test provider. It writes a new lookup-table address to `alt.json`. The current client does not read that file; its hardcoded `altPubkey` must be supplied from the same test setup. The wallet must control the ALT if extension is necessary.
5. Supply the mint addresses from that same environment in place of the client's two historical mint constants. Confirm the provider, deployment ID, mints, and ALT all refer to the same cluster.
6. Add a separate meaningful regression test for `get_balances`, with known classic-token and Token-2022 balances, a missing ATA, and returned-data decoding. The original `tests/wallet_tokens_balance.ts` is scaffold code: its type import uses the crate spelling and it calls `initialize()`, which does not exist in this program. It has been kept unchanged rather than represented as a passing test.

The original folder's `MINTING_GUIDE.md` also refers to `scripts/mint-token.ts`, but that file was not present. That guide was not copied as an executable setup recipe.

No missing core Rust/helper implementation has been identified. End-to-end ALT/transaction execution, confirmation timing, and the returned balances still require a controlled runtime test; a successful compile alone does not establish those results.
