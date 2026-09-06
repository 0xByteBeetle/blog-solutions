# Understanding Contract Deployments, Proxies, and CREATE2 — Part 1

[Read the article](https://andreyobruchkov1996.substack.com/p/understanding-contract-deployments-proxies-and-create2-part-1-696b0b11f8a5) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Recovered source

- [examples/evm/storage](../../../examples/evm/storage)
- [examples/evm/transparent-proxy](../../../examples/evm/transparent-proxy)

## Recorded checks

- [examples/evm/transparent-proxy: runtime-verified](../../../verification/restored-evm.json) (2026-09-06)
- [examples/evm/storage: runtime-verified](../../../verification/restored-evm.json) (2026-09-06)

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | formula | Preserved in the published block; runnable mapping pending |
| [2](published.md#block-2) | command | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | inspection-command | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | commands-and-published-output | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | formula | Preserved in the published block; runnable mapping pending |
| [6](published.md#block-6) | program | [published source](../../../examples/evm/storage-validation/src/Storage.sol) |
| [7](published.md#block-7) | inspection-command | Preserved in the published block; runnable mapping pending |
| [8](published.md#block-8) | command | Preserved in the published block; runnable mapping pending |
| [9](published.md#block-9) | published-hash | Preserved in the published block; runnable mapping pending |
| [10](published.md#block-10) | test-data | Preserved in the published block; runnable mapping pending |
| [11](published.md#block-11) | commands-and-published-output | Preserved in the published block; runnable mapping pending |
| [12](published.md#block-12) | program | [published source](../../../examples/evm/transparent-proxy/src/StorageV1.sol) |
| [13](published.md#block-13) | program | [published source](../../../examples/evm/transparent-proxy/src/StorageV2.sol) |
| [14](published.md#block-14) | program | [published source](../../../examples/evm/transparent-proxy/src/TransparentProxy1967.sol) |
| [15](published.md#block-15) | command | Preserved in the published block; runnable mapping pending |
| [16](published.md#block-16) | commands-and-published-output | Preserved in the published block; runnable mapping pending |
| [17](published.md#block-17) | commands-and-published-output | Preserved in the published block; runnable mapping pending |
| [18](published.md#block-18) | commands-and-published-output | Preserved in the published block; runnable mapping pending |
| [19](published.md#block-19) | intentional-failure-command-and-output | Preserved in the published block; runnable mapping pending |
| [20](published.md#block-20) | inspection-commands | Preserved in the published block; runnable mapping pending |
| [21](published.md#block-21) | commands-and-published-output | Preserved in the published block; runnable mapping pending |
| [22](published.md#block-22) | command | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/foundry/src/Deployments.sol](../../../evm/foundry/src/Deployments.sol)
