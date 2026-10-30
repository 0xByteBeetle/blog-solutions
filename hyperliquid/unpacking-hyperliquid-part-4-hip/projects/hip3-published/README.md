# Part 4 — exact published excerpts

Source: [Hyperliquid Part 4](https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-4-hip).
The article URL/capture timestamp in `source-map.json` are authoritative for this
capture. Eleven files in `published/` preserve native code-block text byte-for-byte,
including trailing newlines. No imports, placeholders or author logic were changed.
The complete recovered [original repository variant](../hip3-original/README.md)
is separate; these excerpts are not claimed to be complete independent programs.

## Stage and verification map

| Block | File | Stage / what was checked |
| --- | --- | --- |
| 2 | `published/block-02.ts` | Action union notation; references undefined `HaltTrading`. Preserved, not type-checked. |
| 3 | `published/block-03.ts` | Registration type notation. Preserved, not type-checked. |
| 4 | `published/block-04.py` | Discovery/read snippet; executed only with synthetic `FakeInfo`. Index preservation/action-ID arithmetic checked. No API read. |
| 6 | `published/block-06.py` | Real offline payload construction, with supplemental Decimal/json imports. Exact JSON fields and 500×100,000,000 conversion checked. No submission. |
| 7 | `published/block-07.py` | Missing-DEX expected failure exercised with synthetic `FakeInfo`. No API read. |
| 8 | `published/block-08.py` | Credential-dependent preparation and public reads. Syntax checked only; NOT executed. |
| 9 | `published/block-09.py` | Interactive signing and submission. Syntax checked only; NOT executed. |
| 10 | `published/block-10.py` | Post-registration lookup; synthetic `FakeInfo` only, not proof a deployment exists. |
| 11 | `published/block-11.py` | Real offline oracle payload construction; nested arrays/price strings verified. Prints loop settings but does NOT execute an updater loop. |
| 19 | `published/block-19.ts` | Oracle type notation. Preserved, not type-checked. |
| 20 | `published/block-20.py` | SDK-call fragment exercised only with a recording fake exchange. Checks call arguments, not SDK signing/submission behavior. |

## Offline setup and commands

Python 3.10+ standard library only. No package installation, SDK/API imports,
credentials, wallets or network access are required by these commands:

```sh
python3 hyperliquid/unpacking-hyperliquid-part-4-hip/projects/hip3-published/offline.py 6
python3 hyperliquid/unpacking-hyperliquid-part-4-hip/projects/hip3-published/offline.py 11
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover \
  -s hyperliquid/unpacking-hyperliquid-part-4-hip/projects/hip3-published/tests -v
```

`offline.py` supplies only `Decimal` and `json` for the two CLI choices. The test
suite supplies explicitly synthetic fixtures for blocks 4, 7, 10 and 20, using
no transport. Source hashes are checked before executing an allowed excerpt.
Blocks 8/9 are refused by this runner. It is a narrow reproduction harness, not
a general sandbox for untrusted code or arbitrary caller-supplied Python objects.

Eight supplemental tests passed; see `verification.json` for command/output,
Python version and hashes. Fake responses marked `fixture` are invented test data,
**not published observations** and not new observations of the real API.

## Limits and credential boundary

Do not directly run the credential/submission snippets or join all fragments into
one automatic script. Block8 reads `HIP3_TESTNET_PRIVATE_KEY`; block9 signs and
sends an action after a typed confirmation. Neither was executed or tested against
credentials here. Read the original variant's README for its complete setup and
explicit consent flow; it is not a reason to run it automatically.

These checks do not establish current HIP-3 auction prices, operator eligibility,
collateral requirements, a registered DEX, actual native action acceptance,
SDK/type compatibility, or successful perpetual-oracle operation. The printed
network/address/coin constants are preserved historical/example values. No live
RPC call, signing operation or transaction was performed by this companion review.
