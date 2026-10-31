# Part 4: HIP-3 payloads and CLI examples

[Article](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-4-hip)

`published/` contains eleven unchanged printed code excerpts, not eleven standalone programs. TypeScript files are type notation, including an undefined HaltTrading reference. Python fragments omit imports/context. The supplemental `offline.py` supplies Decimal/json and allows only reviewed payload blocks 6/11; tests supply synthetic clients for blocks 4/7/10/20. Credential/submission blocks 8/9 cannot run through this harness.

Requires Python 3.10+; standard library only for these commands, run here:

```sh
python3 offline.py 6
python3 offline.py 11
python3 -m unittest discover -s tests -v
python3 -m unittest discover -s original-cli/tests -v
python3 original-cli/02_preview_actions.py
```

`original-cli/` is the materially different, complete [author repository variant](https://github.com/bounty-wiz/HyperLiquidBlogPost4/tree/cdd5e21b6e22229f83661f125cabb68ded9d1061): shared helpers, imports, CLI argument handling and confirmations omitted from the printed excerpts. Original files remain unchanged. Its SDK requirement is pinned to 0.24.0; offline tests and script02 do not require SDK installation.

**Not offline commands:** original script01 reads public APIs; script03 performs live preflight even without execute and can submit registration; script04 imports the SDK and can submit oracle updates. Printed blocks8/9 prepare credentials/sign/submit. Do not execute these as tests. No keys, API calls or submissions are needed for the commands above.

The separate supplemental `original-cli/finite_builders.py` rejects nonfinite prices before calling original builders; originals remain permissive and are not silently rewired. Tests distinguish this correction from preserved original behavior. Offline payload validity does not establish live acceptance, eligibility, collateral, registration or oracle operation.

## Follow the article's CLI workflow

The steps below are **opt-in reader procedures**, not automated tests or a claim of successful deployment. Keep the offline commands above as the default. Use a disposable Testnet identity only for submission; never a personal/funded key. Requires Python 3.10+, existing curl/jq, and the pinned SDK:

```sh
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r original-cli/requirements.txt
python3 original-cli/01_read_market.py --network testnet --dex test --coin test:ABC
python3 original-cli/01_read_market.py --network testnet --dex __missing_classroom__ --coin __missing_classroom__:ABC
```

The first command loads no wallet and reads DEX metadata/context/limits/status/annotation. The historical `test:ABC` may no longer exist. The missing-DEX command should exit **2**, explaining that the DEX was not returned by `perpDexs`; this is a read failure, not a transaction receipt. Script02 prints unsigned offline `registerAsset2`/`setOracle` actions without SDK or RPC access.

Before any live preflight, review current [HIP-3 requirements](https://hyperliquid.gitbook.io/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-3-builder-deployed-perpetuals) and [deployer action schemas](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/hip-3-deployer-actions-1). Requirements, auction prices, reserves and collateral eligibility can change. The CLI checks only the documented subset (name availability, returned collateral and auction cap), not every possible protocol eligibility rule. A preview is not approval or proof of eligibility.

Set `DEX` to a fresh 2–4 lowercase-character namespace and `UPDATER` to the intended disposable Testnet updater's **public address**. This live dry run needs no private key:

```sh
python3 original-cli/03_deploy_testnet.py --dex "$DEX" --symbol DEMO \
  --full-name 'Classroom Demo DEX' --oracle-px 100.0 --sz-decimals 2 \
  --max-gas-hype 500 --updater-address "$UPDATER"
```

Inspect the complete unsigned action, selected collateral, network and live auction. The 500 HYPE cap preserves the article's example; it is not a recommended spend. Do not use maxGas=0 casually: current schemas define reserve consumption. A namespace-already-exists or cap failure is expected when those conditions apply.

Only after separately deciding to submit on **Testnet**, supply `HIP3_TESTNET_PRIVATE_KEY` securely outside the repository and repeat that exact reviewed command with `--execute`. It prompts for `DEPLOY <dex>:DEMO`; do not pass `--yes` in the teaching workflow. The private key is loaded only in execute mode, and the signature uses the Testnet domain. Neither the agent nor CI executes this step.

After an accepted response, read the actual state back:

```sh
python3 original-cli/01_read_market.py --network testnet --dex "$DEX" --coin "$DEX:DEMO"
```

Require the expected namespace, full name, updater, market name, szDecimals, margin settings, context and limits. No readback exists if no registration was submitted; do not label a preview as deployment success.

An optional oracle preview (SDK required, no signing in preview mode):

```sh
python3 original-cli/04_oracle_testnet.py --dex "$DEX" --symbol DEMO \
  --oracle-px 100.12 --mark-px 100.10 --external-perp-px 100.11 \
  --sz-decimals 2 --iterations 3 --interval 3
```

Before a separately confirmed `--execute`, check the live updater authorization, market precision, finite positive prices and full DEX asset coverage. The classroom publisher deliberately supports **one asset only** and rejects a DEX with other assets because `externalPerpPxs` must cover the whole universe. It checks live szDecimals and updater membership before prompting `ORACLE <dex>:DEMO`. The supplemental finite builder rejects NaN/Infinity; preserved original scripts are not silently rewritten. Preview/build tests do not prove update acceptance. No funding, trading, halting or Mainnet submission procedure is added.

## Three Mainnet reads from the article (optional, no wallet)

```sh
curl -fsS https://api.hyperliquid.xyz/info -H 'Content-Type: application/json' -d '{"type":"perpDexs"}' | jq
curl -fsS https://api.hyperliquid.xyz/info -H 'Content-Type: application/json' -d '{"type":"metaAndAssetCtxs","dex":"para"}' | jq
curl -fsS https://api.hyperliquid.xyz/info -H 'Content-Type: application/json' -d '{"type":"perpDexLimits","dex":"para"}' | jq
```

`para` and its prices/limits are historical examples. Metadata universe and context entries correspond by array index; discover current names instead of inventing output when absent. All three are read-only `/info` requests, with no key or exchange action.
