# Diamonds in EVM: The Proxy That Scales Beyond Limits

[Read the article](https://andreyobruchkov1996.substack.com/p/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Recovered source

- [examples/evm/diamond](../../../examples/evm/diamond)

## Recorded checks

- [examples/evm/diamond: build-checked](../../../verification/restored-builds.json) (2026-09-06)

  Checked with: `forge build`
- [examples/evm/diamond: runtime-verified](../../../verification/restored-evm.json) (2026-09-06)

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | instruction-fragment | Preserved in the published block; runnable mapping pending |
| [2](published.md#block-2) | interface | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | interface | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | interface | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | program | [published source](../../../examples/evm/diamond/src/LibDiamond.sol) |
| [6](published.md#block-6) | program | [published source](../../../examples/evm/diamond/src/interfaces/IDiamondCut.sol) |
| [7](published.md#block-7) | program | [published source](../../../examples/evm/diamond/src/interfaces/IDiamondLoupe.sol) |
| [8](published.md#block-8) | program | [published source](../../../examples/evm/diamond/src/Diamond.sol) |
| [9](published.md#block-9) | program | [published source](../../../examples/evm/diamond/src/facets/DiamondCutFacet.sol) |
| [10](published.md#block-10) | program | [published source](../../../examples/evm/diamond/src/facets/DiamondLoupeFacet.sol) |
| [11](published.md#block-11) | program | [published source](../../../examples/evm/diamond/src/facets/OwnershipFacet.sol) |
| [12](published.md#block-12) | program | [published source](../../../examples/evm/diamond/src/facets/ExampleFacet.sol) |
| [13](published.md#block-13) | deployment-script | [published source](../../../examples/evm/diamond/script/DeployDiamond.sol) |
| [14](published.md#block-14) | command | Preserved in the published block; runnable mapping pending |
| [15](published.md#block-15) | deployment-command | Preserved in the published block; runnable mapping pending |
| [16](published.md#block-16) | commands-and-published-output | Preserved in the published block; runnable mapping pending |
| [17](published.md#block-17) | program | [published source](../../../examples/evm/diamond/src/facets/newFacet.sol) |
| [18](published.md#block-18) | command-and-illustrative-output | Preserved in the published block; runnable mapping pending |
| [19](published.md#block-19) | commands | Preserved in the published block; runnable mapping pending |
| [20](published.md#block-20) | commands-and-published-output | Preserved in the published block; runnable mapping pending |
| [21](published.md#block-21) | selector-mapping | Preserved in the published block; runnable mapping pending |
| [22](published.md#block-22) | pseudocode | Preserved in the published block; runnable mapping pending |
| [23](published.md#block-23) | selector-mapping | Preserved in the published block; runnable mapping pending |
| [24](published.md#block-24) | commands-and-published-output | Preserved in the published block; runnable mapping pending |
| [25](published.md#block-25) | library-with-omitted-pragma | Preserved in the published block; runnable mapping pending |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/foundry/src/Diamond.sol](../../../evm/foundry/src/Diamond.sol)
