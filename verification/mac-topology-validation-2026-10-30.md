# Mac validation after article topology migration

Source checkpoint `ccd76228ee5e217bf17b362fc72559a408acab5a` has the exact imported tree `e7c17e440c3e1ab4a0afed8a8c463a7163733c8f` on approved main base `e7d0c04707b6f324b08faa77f72b63b37475418b`. All 83 archive chunks and the replacement helper passed byte counts and SHA-256 checks before application. The HTML-escaped helper was rejected without execution.

The catalog preserves 58 article trees, 573 native blocks and 347 source files. Full commands, tool versions, hashes and logs are recorded in [the JSON report](mac-topology-validation-2026-10-30.json). Historical cloud reports remain in [the archive](history/2026-10-30-before-mac-topology).

## Passing checks

- 28 repository integrity/topology tests; all catalog, EVM/Solana/Hyperliquid alignment and dated source-freshness checks.
- All 15 recovered EVM build/unit checks plus the zero-copy layout host test; all six recovered EVM local Anvil scenarios.
- Additional EVM companions: 18 Foundry checks and eight loopback simulation assertions across seven articles. All 51 Solana companion static checks passed; details are listed in `additional-companions.json`.
- Hyperliquid: 39 offline/mock checks across five article trees, plus three Rust shape checks in each of the two copied account-shape projects. Signing uses its own pinned Python 3.12 virtual environment and deterministic NEVER-FUND fixtures.
- Supplementary Rust/Go/Foundry/TypeScript and metadata checks passed; these are distinct from article coverage.

## Solana on disposable validators

All runs use Anchor 0.31.1, Agave 3.1.9 and cached SBF tools, with Node 22.6.0 and `NODE_OPTIONS=--experimental-require-module`. Cargo runs offline; no toolchain was installed. Runtime suites are sequential with private wallets/program IDs/ledgers and a bounded process-group watchdog.

| Article route / mode | Exit | Integration checks |
| --- | ---: | --- |
| `original-zero-copy` | 0 | 1 passing, 0 failing |
| `original-borsh-profile` | 0 | 1 passing, 0 failing |
| `original-borsh-proposal` | 0 | 1 passing, 0 failing |
| `original-anchor-accounts` | 0 | 3 passing, 0 failing |
| `original-transfer-hook-regression` | 0 | 2 passing, 0 failing |
| `published-zero-copy` | 0 | 1 passing, 0 failing |
| `original-wallet-build` | 0 | 0 passing, 0 failing |
| `original-wallet-cold-regression` | 1 | 0 passing, 2 failing |
| `original-wallet-prepared-alt` | 0 | 2 passing, 0 failing |
| `original-wallet-alt-ready` | 0 | 6 passing, 0 failing |
| `printed-hook-build` | 1 | 0 passing, 0 failing |
| `printed-hook-check-annotations` | 0 | 2 passing, 0 failing |
| `printed-wallet-build` | 0 | 0 passing, 0 failing |
| `printed-wallet-cold-regression` | 1 | 0 passing, 2 failing |
| `printed-wallet-prepared-alt` | 0 | 2 passing, 0 failing |
| `printed-wallet-alt-ready` | 0 | 6 passing, 0 failing |
| `printed-hook-build-evidence-fix` | 1 | 0 passing, 0 failing |

Both cold-ALT failures are the preserved invalid-index race. The first printed-hook build also exposed a supplemental evidence-filename bug; its raw log is retained. After correcting the evidence path to `scripts/run-local.mjs`, the strict printed build was repeated and records the real Anchor missing-CHECK lint failure. The separately selected two-comment CHECK variant passes two local checks, including the adapted printed initialization client. Neither printed source nor recovered original implementations were silently changed.

## Token-2022 CLI workshops

The original CLI5.6.1 reference gate rejected installed CLI5.5.0 before keys or RPC. Full stdout/stderr and exit status for the 15 requested help/version calls plus both Agave versions are retained in [CLI capability evidence](mac-topology-cli-capabilities-2026-10-30.json). All used options and positional syntax are supported. The three nonconfidential runners now allow only the reviewed CLI5.5.0/Agave3.1.9 pair in addition to the prior documented CLI5.6.1 path; used-capability checks and local endpoint guards remain. Unsupported versions, unreviewed Agave pairs and missing flags are regression-tested through `--execute-local` before action. The confidential runner is unchanged.

| Article | Actual local outcome |
| --- | --- |
| `from-convention-to-explicit-state` | Exit 0; 5.8 seconds; fixture directories removed: 1 |
| `engineering-native-yield-a-deep-dive` | Exit 0; 8.81 seconds; fixture directories removed: 1 |
| `the-utility-extensions-completing` | Exit 0; 17.89 seconds; fixture directories removed: 1 |

Utility negative checks require the Token-2022 program ID and the specific rejection reason, then assert token balances did not change. Separate failure logs are retained. The first utility attempt stopped at the CLI memo precheck; its log is retained. A supplemental direct instruction then verifies the actual program NoMemo rejection below that precheck and unchanged balances before the memo-bearing transfer succeeds. Interest RPC captures require confirmed context/value shape, raw principal 100×10^9, nine decimals and finite nondecreasing UI amounts. Equality is allowed. External metadata-pointer evidence proves a distinct stored address, not a functioning metadata account.

## Boundaries and cleanup

- Exact printed transfer-hook source fails Anchor IDL safety lint without the explicitly selected two-CHECK-comment variant; comments add no runtime account validation.
- Original and printed cold-ALT clients each reproduce 0 passing / 2 failing invalid-index checks. Prepared-ALT mode and corrected client are separate claims.
- Confidential transfer execution remains unconditionally blocked; no proof-enabled runtime established. Its reference version gate and published commands are unchanged.
- Interest observations establish unchanged raw principal and nondecreasing finite UI amount over a short interval, permitting equality; no positive-accrual/formula claim.
- External metadata pointer stores a distinct address only; no external metadata account or reverse link was created.
- Unfinished articles remain unfinished. Host/mocked/local runtime results do not establish public-network behavior.

Cleanup evidence is in the JSON report. Temporary task-owned wallets, ledgers and validator processes were removed. Agave RPC/faucet listeners may bind all interfaces despite configured loopback; the earlier disclosed temporary listener authorization applies. No public-chain transaction, public faucet, personal wallet or real funds were used. Only the owned genesis faucet funded disposable local fixtures.
