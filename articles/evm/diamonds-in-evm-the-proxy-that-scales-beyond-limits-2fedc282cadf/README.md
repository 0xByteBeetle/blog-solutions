# Diamonds in EVM: The Proxy That Scales Beyond Limits

[Read the article](https://andreyobruchkov1996.substack.com/p/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Recovered source

- [examples/evm/diamond](../../../examples/evm/diamond)

## Recorded checks

- [examples/evm/diamond: build-checked](../../../verification/restored-builds.json) (2026-09-06)
- [examples/evm/diamond: runtime-verified](../../../verification/restored-evm.json) (2026-09-06)

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | unclassified | Preserved in the published block; runnable mapping pending |
| [2](published.md#block-2) | unclassified | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | unclassified | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | unclassified | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | source-excerpt | [published source](../../../examples/evm/diamond/src/LibDiamond.sol) |
| [6](published.md#block-6) | source-excerpt | [published source](../../../examples/evm/diamond/src/interfaces/IDiamondCut.sol) |
| [7](published.md#block-7) | source-excerpt | [published source](../../../examples/evm/diamond/src/interfaces/IDiamondLoupe.sol) |
| [8](published.md#block-8) | source-excerpt | [published source](../../../examples/evm/diamond/src/Diamond.sol) |
| [9](published.md#block-9) | source-excerpt | [published source](../../../examples/evm/diamond/src/facets/DiamondCutFacet.sol) |
| [10](published.md#block-10) | source-excerpt | [published source](../../../examples/evm/diamond/src/facets/DiamondLoupeFacet.sol) |
| [11](published.md#block-11) | source-excerpt | [published source](../../../examples/evm/diamond/src/facets/OwnershipFacet.sol) |
| [12](published.md#block-12) | source-excerpt | [published source](../../../examples/evm/diamond/src/facets/ExampleFacet.sol) |
| [13](published.md#block-13) | solidity-source | [published source](../../../examples/evm/diamond/script/DeployDiamond.sol) |
| [14](published.md#block-14) | unclassified | Preserved in the published block; runnable mapping pending |
| [15](published.md#block-15) | unclassified | Preserved in the published block; runnable mapping pending |
| [16](published.md#block-16) | unclassified | Preserved in the published block; runnable mapping pending |
| [17](published.md#block-17) | source-excerpt | [published source](../../../examples/evm/diamond/src/facets/newFacet.sol) |
| [18](published.md#block-18) | unclassified | Preserved in the published block; runnable mapping pending |
| [19](published.md#block-19) | unclassified | Preserved in the published block; runnable mapping pending |
| [20](published.md#block-20) | unclassified | Preserved in the published block; runnable mapping pending |
| [21](published.md#block-21) | unclassified | Preserved in the published block; runnable mapping pending |
| [22](published.md#block-22) | unclassified | Preserved in the published block; runnable mapping pending |
| [23](published.md#block-23) | unclassified | Preserved in the published block; runnable mapping pending |
| [24](published.md#block-24) | unclassified | Preserved in the published block; runnable mapping pending |
| [25](published.md#block-25) | unclassified | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/foundry/src/Diamond.sol](../../../evm/foundry/src/Diamond.sol)
