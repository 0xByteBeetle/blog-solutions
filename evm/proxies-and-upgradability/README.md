# Proxies and Upgradability - Transparent Proxy (EIP-1967)

[Read the article](https://andreyobruchkov1996.substack.com/p/proxies-and-upgradability) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [evm/proxies-and-upgradability/projects/transparent-proxy](projects/transparent-proxy)

## Recorded checks

- [evm/proxies-and-upgradability/projects/transparent-proxy: build-checked](../../verification/restored-evm-builds.json) (2026-10-30)

  Checked with: `forge build`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | program | [published source](projects/transparent-proxy/src/StorageV1.sol) |
| [2](published.md#block-2) | program | [published source](projects/transparent-proxy/src/StorageV2.sol) |
| [3](published.md#block-3) | program | [published source](projects/transparent-proxy/src/TransparentProxy1967.sol) |
| [4](published.md#block-4) | command | Reference/command/output preserved; no standalone program implied |
| [5](published.md#block-5) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [6](published.md#block-6) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [7](published.md#block-7) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [8](published.md#block-8) | intentional-failure-command | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [9](published.md#block-9) | inspection-commands | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [10](published.md#block-10) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [11](published.md#block-11) | command | Reference/command/output preserved; no standalone program implied |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/proxies-and-upgradability/supplementary/foundry/src/Deployments.sol](supplementary/foundry/src/Deployments.sol)
