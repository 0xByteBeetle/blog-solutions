# Understanding Contract Deployments, Proxies, and CREATE2 — Part 2

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-contract-deployments-proxies-and-create2-part-2-df8f05998d5e) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [evm/understanding-contract-deployments-proxies-and-create2-part-2-df8f05998d5e/projects/uups](projects/uups)
- [evm/understanding-contract-deployments-proxies-and-create2-part-2-df8f05998d5e/projects/factory](projects/factory)
- [evm/understanding-contract-deployments-proxies-and-create2-part-2-df8f05998d5e/projects/minimal-proxy](projects/minimal-proxy)

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | program | [published source](projects/uups/src/UUPSLogicContract.sol) |
| [2](published.md#block-2) | program | [published source](projects/uups/src/UUPSProxy.sol) |
| [3](published.md#block-3) | command | Reference/command/output preserved; no standalone program implied |
| [4](published.md#block-4) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [5](published.md#block-5) | inspection-command | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [6](published.md#block-6) | program | [published source](projects/factory/src/basicfactory.sol) |
| [7](published.md#block-7) | command | Reference/command/output preserved; no standalone program implied |
| [8](published.md#block-8) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [9](published.md#block-9) | bytecode-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [10](published.md#block-10) | program | [published source](projects/minimal-proxy/src/minimalProxy.sol) |
| [11](published.md#block-11) | command | Reference/command/output preserved; no standalone program implied |
| [12](published.md#block-12) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [13](published.md#block-13) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [14](published.md#block-14) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/understanding-contract-deployments-proxies-and-create2-part-2-df8f05998d5e/supplementary/foundry/src/Deployments.sol](supplementary/foundry/src/Deployments.sol)
