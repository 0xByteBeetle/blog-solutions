# Solana local-validator follow-through — October 30, 2026

The selected suites below were executed on macOS arm64 with disposable local
wallet/program keys and local genesis funds. This supplements the earlier
source/host review; it does not establish complete article coverage.
The [machine-readable report](solana-local-validator-2026-10-30.json) binds each
result to its report hash. September reports are retained in
[the historical archive](history/2026-10-30-before-mac-local-validator/).

## Executed checks

All runner commands use `node scripts/run-original-anchor.mjs` from repository
root with the following arguments. They use temporary copies, not the original
personal-wallet/devnet configurations.

| Arguments | Observed result | Scope |
| --- | --- | --- |
| `zero-copy-original` | 1 pass | Initialize/update; volume 500 and active flag 1 asserted. |
| `borsh-profile` | 1 pass | Creates the fixed profile and logs its raw bytes. |
| `borsh-proposal` | 1 pass | Creates the fixed proposal and logs its raw bytes. |
| `anchor-accounts` | 3 passes | Original create/update/close tests; signatures logged. |
| `transfer-hook-original --regression` | 2 passes | Specific oversized-transfer rejection and unchanged balances, then exact successful transfer balances. |
| `wallet-token-balances-original --regression --alt-ready` | 6 passes, repeated on another fresh validator | Empty ALT extension, exact classic/Token-2022 balances, missing ATA/reuse, later extension, readiness visibility/slot, timeout and RPC errors. |
| `zero-copy` | 1 pass | Published module variant; volume and active flag asserted. |
| `wallet-token-balances-original --build-only` | Pass | Original SBF build and both original client TypeScript checks; stale scaffold test excluded. |
| `wallet-token-balances-original --regression` | Expected failure: 0 pass, 2 fail | Original cold-ALT behavior reproduces invalid lookup-table index; no original source repair. |
| `wallet-token-balances-original --regression --prepared-alt` | 2 passes | Original client with an already populated/finalized ALT; does not verify cold extension. |

There are **17 distinct passing integration checks** across eight positive
runtime suites. The corrected six-check suite passed twice; the repeat is not
counted as six additional distinct checks. All seven existing fundamentals host
tests also passed with no filters. The six layout/allocation host assertions
from the earlier [host report](solana-host-checks-2026-10-30.json) remain separate.

## Fresh failures and the corrected variant

The first SBF build succeeded, but the Node 22.6 launcher failed to load a pinned
ESM dependency through CommonJS. Running with
`NODE_OPTIONS=--experimental-require-module` resolved that environment issue.
The failed attempt is [archived](history/2026-10-30-mac-local-validator-attempts/zero-copy-original-node22-launcher-failure.json).
No dependency or author-source rewrite was needed.

The labeled corrected wallet client initially returned four passes and two
`TransactionExpiredBlockheightExceededError` failures after ALT extensions.
That [failed capped-retry run](history/2026-10-30-mac-local-validator-attempts/wallet-alt-ready-three-retry-expiry.json)
is retained. The variant's `maxRetries: 3` override was removed so the RPC can use
its default rebroadcast policy for the same signed transaction. Confirmed
preflight, minimum context slot, ALT polling and blockheight confirmation remain;
preflight is enabled, and the client does not automatically re-sign with a new
blockhash. Both subsequent fresh runs pass all six tests. Extension-consuming
transactions took roughly 19–20 seconds in these runs.

The [first corrected pass](history/2026-10-30-mac-local-validator-attempts/wallet-alt-ready-default-retries-first-pass.json)
and [repeat](wallet-token-balances-original-regression-alt-ready.json) have the
same corrected source hash. This supports the retry-policy change in these
fixtures; it is not a universal delivery guarantee. Solana documents the
separation between RPC acceptance and confirmation in
[sendTransaction](https://solana.com/docs/rpc/http/sendtransaction) and recommends
consistent commitment and appropriate rebroadcast in its
[confirmation guide](https://solana.com/developers/cookbook/transactions/confirmation).
The original `client.ts`, Rust program, snapshots and source-manifest hashes are
unchanged.

## Environment, isolation and cleanup

- Node 22.6.0 with the compatibility flag above; locked npm dependencies restored
  using `npm ci --ignore-scripts`. Optional native bigint bindings used the JS fallback.
- Anchor 0.31.1, Agave 3.1.9, cached SBF platform-tools v1.52 / Rust 1.89.0,
  host Cargo 1.92.0 and installed Rust 1.93.0 nightly for IDL builds.
- Cargo ran offline. The two workspaces without original Cargo.lock files have
  their exact generated dependency locks saved as [supplemental build evidence](solana-local-validator-locks/README.md).
- Suites ran sequentially after checking TCP/UDP ports 19899–20000. Each used a
  private task-owned temporary directory, `umask 077`, new payer/program keys and
  a separate process group with a 900-second watchdog; no watchdog timeout occurred.
- Tests used only `http://127.0.0.1:19899`. Listener inspection showed Agave's RPC
  and faucet listeners on all interfaces despite the configured loopback bind.
  These temporary services held only disposable local state. No firewall, VPN or
  other security settings were changed.
- After each suite the runner removed its wallet/project/ledger and the wrapper
  stopped only its process group. Final cleanup removed compiler temp caches.
  `ps`, `lsof` and task-owned key-file checks found **zero** remaining test
  processes, listeners, wallet/program key files or ledger directories.
- Personal wallet secrets and public-chain RPCs were not accessed. Metadata
  submission, confidential-transfer/proof operations and Sui transactions were
  not run. The [installed CLI report](installed-chain-cli-capabilities-2026-10-30.json)
  records version/help inspection only.

The repository catalog, all alignment/freshness checks and **20 Node tests** pass:
58 articles, 573 saved blocks and 143 recovered source files remain intact.
The separately transferred dated browser evidence covers 53 EVM/Solana articles
and 494 exact saved blocks; source freshness is not runnable implementation coverage.
