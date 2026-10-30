# Utility extensions: combined permissions

Self-contained supplemental workshop for the article identified in `source-map.json`.
All 13 published blocks are byte-for-byte in `published/`; hashes trace each to its
source URL/block. These are code/commands/output only, not duplicated article prose.
`scenario.sh`, `local-harness.sh`, tests and config are supplemental, not author-source.

## What changed

Existing utility branches were reused. The missing combined permanent-delegate/nontransferable case now creates one mint with BOTH flags, mints100 to the holder, burns50 as permanent delegate, and rejects a holder transfer with unchanged balances. The explicit numbers are supplemental fixtures, not restored historical outputs.

Existing healthy code was reused from the **historical pre-migration provenance path** `solana/token-2022/run-local.sh` (not a current runnable path), rather than
replacing its implementations. Per-article extraction isolates only relevant scenarios.
Environment adaptations are explicit: historical addresses/placeholders become newly
created disposable local addresses, owner/fee-payer arguments are explicit, and all
RPC/config references point to a private loopback fixture. Originals remain unchanged.

## Requirements and safe execution

Read `requirements.json`. The published/reference CLI5.6.1 / Agave4.2.1 versions
remain recorded. Supplemental preflight also accepts the reviewed installed pair
CLI5.5.0 with Solana CLI/validator3.1.9 after checking the used flags. Full captured
5.5.0 help is retained in `tests/fixtures/cli-help-5.5.0.json`; repository-wide raw
version/help results are in `verification/mac-topology-cli-capabilities-2026-10-30.json`.
Unsupported versions, an unreviewed Agave pair, or missing capabilities fail before
keys, RPC or validator startup. No bypass flag, automatic install or public fallback.
Passing help/preflight checks alone does not establish runtime behavior.

```sh
python3 -m unittest discover -s tests -v  # static/fixture tests only
bash run.sh --preflight                  # no keys, validator, RPC or transactions
# Only in a coordinated disposable-local session after preflight review:
bash run.sh --execute-local
```

`--execute-local` is deliberately BLOCKED for the confidential workshop. For other
workshops it creates only fresh `.local/run-*` files and its own validator, records logs,
uses a separate config and stops that validator at exit. No default wallet or CLI config
is read. RPC is hardcoded127.0.0.1, proxies are disabled, external URL overrides are
rejected before any tools/keys, and occupied RPC ports are rejected. Use
`WORKSHOP_RPC_PORT` to choose an unused port1024–64000; do not overlap another worker.
No external clone-feature-set, public RPC, mainnet/devnet/testnet transactions or
real funds. Each article contains its own essential setup; no shared dependency path.

## Actual verification / remaining gate

**5 Python tests PASS on2026-10-30:** exact source hashes, shell syntax,
external-URL rejection, invalid-port rejection and local-only config checks.
Interest additionally has3 synthetic checker tests, not chain-output evidence.
**Local validator, CLI scenario and transaction tests NOT RUN** in cloud (tools absent).
No new signing keys or validator were created during preparation.

Combined extension support and exact CLI/program rejection logs must be verified by the supported local validator. Negative helper requires program-simulation failure plus unchanged balances, but exact program-error decoding remains a runtime review gate.

## Primary references checked for setup (2026-10-30)

- [Official CLI reference](https://solana.com/docs/references/spl-token-cli): version/flag reference, not runtime acceptance evidence.
- [Token-2022 extension guide](https://www.solana-program.com/docs/token-2022/extensions): extension/pointer setup reference.
- [Token-2022 status](https://www.solana-program.com/docs/token-2022/status): confidential transfers require the proof-enabled runtime.

Never run `published/*.txt` as shell scripts: they include placeholders, historical
accounts, omitted setup, outputs and deliberate failures.

## Memo CLI and program checks

CLI5.5.0 rejects a memo-less transfer before sending a transaction. That exact CLI
precheck is recorded separately. The supplemental `assert-memo-program-rejection.mjs`
constructs a local Token-2022 checked transfer without a memo, requires the actual
program's NoMemo simulation rejection, and checks both token balances remain100/0.
It accepts only loopback RPC and this article's fresh `.local/run-*` fixture directory;
it reads only that run's generated payer/alice files. A transfer with a memo must then
succeed. RPC/signing failures are not accepted as program-rejection evidence.

Prepare the fixture's own pinned libraries before explicit local execution, using an
installed compatible Node version (validated22.6.0; no toolchain auto-install):

```sh
npm ci --prefix runtime-deps --ignore-scripts
```

The wrapper supplies `--experimental-require-module` for the installed CommonJS/ESM
Web3 interoperability. Published commands and source are unchanged. This direct
fixture is supplemental protocol verification, not a claim the CLI sent its rejected
memo-less request.

## Mac runtime result (2026-10-30)

Permanent delegate burn, nontransferable rejection, frozen mint rejection/thaw, CLI memo precheck, direct Token-2022 NoMemo program rejection with unchanged100/0 balances, memo-bearing transfer, and combined permanent-delegate/nontransferable mint behavior passed. The first attempt stopped at the CLI memo precheck and is retained; the supplemental direct-instruction fixture closes the program-level check.

These are observed disposable-local results with CLI5.5.0/Agave3.1.9, not a public-network claim. [Full commands, logs and cleanup](../../../verification/mac-topology-validation-2026-10-30.md) are recorded separately from the earlier cloud static-only results.
