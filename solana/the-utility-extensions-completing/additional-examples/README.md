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

Read `requirements.json`. This stages the documented CLI5.6.1 / Agave4.2.1 reference
pair, not a claim those tools are installed or tested here. Preflight checks the exact
CLI version and needed flags; a different supported pair needs a reviewed config
change after recording its version/capabilities. No automatic install or silent fallback.

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
