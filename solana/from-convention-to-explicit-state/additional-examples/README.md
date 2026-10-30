# Metadata pointers: embedded and external addresses

Self-contained supplemental workshop for the article identified in `source-map.json`.
All 6 published blocks are byte-for-byte in `published/`; hashes trace each to its
source URL/block. These are code/commands/output only, not duplicated article prose.
`scenario.sh`, `local-harness.sh`, tests and config are supplemental, not author-source.

## What changed

Existing embedded-metadata branch is reused. Supplemental external-pointer branch generates a disposable address, creates a distinct mint pointing to it, and inspects the stored address. The target has NO metadata data initialized; the test only proves pointer storage, matching the printed create/display commands.

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

Do not claim pointer storage makes the target a valid canonical metadata account. A consumer must validate the target contents/reverse relationship separately. Shell continuation whitespace from exact snapshots is preserved; runnable scaffolding uses syntactically valid continuations.

## Primary references checked for setup (2026-10-30)

- [Official CLI reference](https://solana.com/docs/references/spl-token-cli): version/flag reference, not runtime acceptance evidence.
- [Token-2022 extension guide](https://www.solana-program.com/docs/token-2022/extensions): extension/pointer setup reference.
- [Token-2022 status](https://www.solana-program.com/docs/token-2022/status): confidential transfers require the proof-enabled runtime.

Never run `published/*.txt` as shell scripts: they include placeholders, historical
accounts, omitted setup, outputs and deliberate failures.

## Mac runtime result (2026-10-30)

Embedded metadata initialization/custom-field update passed. The distinct external address was retained in the metadata pointer; no external metadata account or reverse link was created.

These are observed disposable-local results with CLI5.5.0/Agave3.1.9, not a public-network claim. [Full commands, logs and cleanup](../../../verification/mac-topology-validation-2026-10-30.md) are recorded separately from the earlier cloud static-only results.
