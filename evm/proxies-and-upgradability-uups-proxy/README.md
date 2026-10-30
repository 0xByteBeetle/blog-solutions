# Proxies and Upgradability - UUPS proxy (EIP-1822)

[Read the article](https://andreyobruchkov1996.substack.com/p/proxies-and-upgradability-uups-proxy) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [evm/proxies-and-upgradability-uups-proxy/projects/uups](projects/uups)

## Recorded checks

- [evm/proxies-and-upgradability-uups-proxy/projects/uups: build-checked](../../verification/restored-evm-builds.json) (2026-10-30)

  Checked with: `forge build`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | program | [published source](projects/uups/src/UUPSLogicContract.sol) |
| [2](published.md#block-2) | program | [published source](projects/uups/src/UUPSProxy.sol) |
| [3](published.md#block-3) | command | Reference/command/output preserved; no standalone program implied |
| [4](published.md#block-4) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [5](published.md#block-5) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/proxies-and-upgradability-uups-proxy/supplementary/foundry/src/Deployments.sol](supplementary/foundry/src/Deployments.sol)
