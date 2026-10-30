# HIP-3: recovered original repository variant

Source: [bounty-wiz/HyperLiquidBlogPost4](https://github.com/bounty-wiz/HyperLiquidBlogPost4/tree/cdd5e21b6e22229f83661f125cabb68ded9d1061),
revision `cdd5e21b6e22229f83661f125cabb68ded9d1061`, explicitly linked by
[Hyperliquid Part 4](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-4-hip).

The four numbered scripts, `hip3_common.py`, `requirements.txt`, and `.gitignore`
are copied byte-for-byte. Their hashes and paths are recorded in
[`catalog/source-files.json`](../../../catalog/source-files.json). This README and
`tests/test_offline.py` and `finite_builders.py` are supplemental, not original author implementations.

**This is an original-repository variant, not an exact displayed-article snapshot.**
The article explains that its snippets omit imports/CLI/helpers. Exact published
block matching awaits faithful HTML; the flattened historical export is not enough.
Full blog prose is intentionally not duplicated here.

## Start offline

Supplemental runtime floor: **Python 3.10+** (type syntax used by the source).
The original `requirements.txt` pins **hyperliquid-python-sdk==0.24.0**. No SDK or
third-party dependency is needed for the following offline commands:

```sh
# From repository root:
python3 -m unittest discover -s examples/hyperliquid/hip3-original/tests -v
python3 examples/hyperliquid/hip3-original/02_preview_actions.py
```

Script02 constructs unsigned JSON only. Its `500` HYPE value is an example cap,
not a spend request or recommendation. Keep the distinction between native HYPE
units and decimal HYPE explicit; tests assert exact conversion and reject excess
fractional precision instead of rounding it away.

## Scripts are not interchangeable test commands

| File | Behavior / prerequisite |
| --- | --- |
| `hip3_common.py` | Pure action builders/validation, plus optional JSON file output. |
| `02_preview_actions.py` | Offline unsigned action construction; no wallet or API. |
| `01_read_market.py` | Public API reads, SDK required; live observations are not stable fixtures. |
| `03_deploy_testnet.py` | Live preflight even without execution; wallet/env configuration and SDK. Explicit execution can submit registration. **Not an offline test.** |
| `04_oracle_testnet.py` | SDK import required even for preview; execution mode can submit oracle updates. **Not part of the verified offline suite.** |

Only if preparing a separately authorized SDK stage, use an isolated virtualenv
and the original pinned requirements. Installing them does not authorize any
transaction. Review scripts/arguments before execution; never commit `.env`, keys,
wallets or output containing secrets. No network execution is needed for the suite
above. A submitted response alone would not prove the intended market state changed.

## Known teaching-scope validation limits

These are preserved source behaviors, not silent corrections:

- `validate_perp_price` and `build_set_oracle_action` accept the string `Infinity`.
  The test `test_characterize_nonfinite_price_validation_gap` demonstrates this;
  passing that characterization test does **not** make the input valid for a server.
  The separate `finite_builders.py` wrappers reject `Infinity`, `-Infinity`, `NaN`,
  and `sNaN` (and other nonfinite Decimal spellings) before calling the original
  builders. Valid inputs and action schemas are unchanged. The original scripts
  deliberately remain wired to their original helpers; they do not silently gain
  this correction. Opt into `build_register_asset2_action_finite` or
  `build_set_oracle_action_finite` explicitly in supplemental code.
- Oracle construction checks positive prices and deterministic sorting, but does
  not fetch live `szDecimals`, market completeness or updater authority. It cannot
  establish those facts without separate metadata/authorization checks.
- DEX-name validation checks length and colon exclusion, not full protocol name
  acceptance. Python type hints are not runtime validation of arbitrary inputs.

These helpers are educational action constructors, not production trading policy.
Do not treat offline validity as protocol acceptance or deployer authorization.

## Verification — 2026-10-30

Ten supplemental stdlib tests passed on Python 3.12.14: exact native-unit conversion, namespace and
price boundaries, registration guards/shape, oracle sorting/mutation checks,
oracle guard boundaries, nonfinite-input characterization, and script02 subprocess
preview plus rejected zero cap, finite-wrapper payload equivalence, and all four
nonfinite spellings rejected in registration and every oracle map. Original files
retained byte-for-byte hashes.

Not run: SDK-dependent scripts01/03/04, network reads, signing, deployment, oracle
submission, or live state reconciliation. No new keys, dependencies or wallets were
created by this offline check. Article snapshot fidelity remains a separate gate.
