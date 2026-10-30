# Interest-bearing mint: principal and RPC UI amount

Self-contained supplemental workshop for the article identified in `source-map.json`.
All 10 published blocks are byte-for-byte in `published/`; hashes trace each to its
source URL/block. These are code/commands/output only, not duplicated article prose.
`scenario.sh`, `local-harness.sh`, tests and config are supplemental, not author-source.

## What changed

Existing500→1000bps rate setup is reused. Supplemental RPC captures before/after getTokenAccountBalance on loopback verify raw principal100000000000 at9decimals and nondecreasing finite uiAmountString. Equality is allowed for short elapsed time/rounding; no historical article yield value is hardcoded.

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

**8 Python tests PASS on2026-10-30:** exact source hashes, shell syntax,
external-URL rejection, invalid-port rejection and local-only config checks.
Interest additionally has3 synthetic checker tests, not chain-output evidence.
**Local validator, CLI scenario and transaction tests NOT RUN** in cloud (tools absent).
No new signing keys or validator were created during preparation.

CLI/Token2022 runtime must be verified. This checks RPC presentation versus unchanged principal, not an exact independently derived exponential interest formula; equality does not prove positive accrued yield. The upstream authority-omitted fragment is preserved, not invented as a full program.

## Primary references checked for setup (2026-10-30)

- [Official CLI reference](https://solana.com/docs/references/spl-token-cli): version/flag reference, not runtime acceptance evidence.
- [Token-2022 extension guide](https://www.solana-program.com/docs/token-2022/extensions): extension/pointer setup reference.
- [Token-2022 status](https://www.solana-program.com/docs/token-2022/status): confidential transfers require the proof-enabled runtime.

Never run `published/*.txt` as shell scripts: they include placeholders, historical
accounts, omitted setup, outputs and deliberate failures.
