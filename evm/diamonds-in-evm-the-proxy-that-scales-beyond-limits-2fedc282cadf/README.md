# Diamonds in EVM: The Proxy That Scales Beyond Limits

[Read the article](https://andreyobruchkov1996.substack.com/p/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [evm/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf/projects/diamond](projects/diamond)
- [evm/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf/additional-examples](additional-examples)

  Run: `forge test --root evm/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf/additional-examples`

## Recorded checks

- [evm/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf/projects/diamond: build-checked](../../verification/restored-evm-builds.json) (2026-10-30)

  Checked with: `forge build`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | instruction-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [2](published.md#block-2) | interface | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [3](published.md#block-3) | interface | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [4](published.md#block-4) | interface | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [5](published.md#block-5) | program | [published source](projects/diamond/src/LibDiamond.sol) |
| [6](published.md#block-6) | program | [published source](projects/diamond/src/interfaces/IDiamondCut.sol) |
| [7](published.md#block-7) | program | [published source](projects/diamond/src/interfaces/IDiamondLoupe.sol) |
| [8](published.md#block-8) | program | [published source](projects/diamond/src/Diamond.sol) |
| [9](published.md#block-9) | program | [published source](projects/diamond/src/facets/DiamondCutFacet.sol) |
| [10](published.md#block-10) | program | [published source](projects/diamond/src/facets/DiamondLoupeFacet.sol) |
| [11](published.md#block-11) | program | [published source](projects/diamond/src/facets/OwnershipFacet.sol) |
| [12](published.md#block-12) | program | [published source](projects/diamond/src/facets/ExampleFacet.sol) |
| [13](published.md#block-13) | deployment-script | [published source](projects/diamond/script/DeployDiamond.sol) |
| [14](published.md#block-14) | command | Reference/command/output preserved; no standalone program implied |
| [15](published.md#block-15) | deployment-command | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [16](published.md#block-16) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [17](published.md#block-17) | program | [published source](projects/diamond/src/facets/newFacet.sol) |
| [18](published.md#block-18) | command-and-illustrative-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [19](published.md#block-19) | commands | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [20](published.md#block-20) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [21](published.md#block-21) | selector-mapping | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [22](published.md#block-22) | pseudocode | Reference/command/output preserved; no standalone program implied |
| [23](published.md#block-23) | selector-mapping | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [24](published.md#block-24) | commands-and-published-output | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [25](published.md#block-25) | library-with-omitted-pragma | [published source](additional-examples/src/Block25.sol) |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf/supplementary/foundry/src/Diamond.sol](supplementary/foundry/src/Diamond.sol)
