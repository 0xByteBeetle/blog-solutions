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
