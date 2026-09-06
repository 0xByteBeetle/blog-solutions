# Understanding Contract Deployments, Proxies, and CREATE2 — Part 2

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-contract-deployments-proxies-and-create2-part-2-df8f05998d5e) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Recovered source

- [examples/evm/uups](../../../examples/evm/uups)
- [examples/evm/factory](../../../examples/evm/factory)
- [examples/evm/minimal-proxy](../../../examples/evm/minimal-proxy)

## Recorded checks

- [examples/evm/factory: runtime-verified](../../../verification/restored-evm.json) (2026-09-06)
- [examples/evm/minimal-proxy: runtime-verified](../../../verification/restored-evm.json) (2026-09-06)
- [examples/evm/uups: runtime-verified](../../../verification/restored-evm.json) (2026-09-06)

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | source-excerpt | [published source](../../../examples/evm/uups/src/UUPSLogicContract.sol) |
| [2](published.md#block-2) | source-excerpt | [published source](../../../examples/evm/uups/src/UUPSProxy.sol) |
| [3](published.md#block-3) | unclassified | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | unclassified | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | unclassified | Preserved in the published block; runnable mapping pending |
| [6](published.md#block-6) | source-excerpt | [published source](../../../examples/evm/factory/src/basicfactory.sol) |
| [7](published.md#block-7) | unclassified | Preserved in the published block; runnable mapping pending |
| [8](published.md#block-8) | unclassified | Preserved in the published block; runnable mapping pending |
| [9](published.md#block-9) | unclassified | Preserved in the published block; runnable mapping pending |
| [10](published.md#block-10) | source-excerpt | [published source](../../../examples/evm/minimal-proxy/src/minimalProxy.sol) |
| [11](published.md#block-11) | unclassified | Preserved in the published block; runnable mapping pending |
| [12](published.md#block-12) | unclassified | Preserved in the published block; runnable mapping pending |
| [13](published.md#block-13) | unclassified | Preserved in the published block; runnable mapping pending |
| [14](published.md#block-14) | unclassified | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/foundry/src/Deployments.sol](../../../evm/foundry/src/Deployments.sol)
