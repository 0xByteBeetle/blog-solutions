# Where Token Metadata Lives on Solana: From Convention to Explicit Data

[Read the article](https://andreyobruchkov1996.substack.com/p/where-token-metadata-lives-on-solana) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | command | Preserved in the published block; runnable mapping pending |
| [2](published.md#block-2) | command | Preserved in the published block; runnable mapping pending |
| [3](published.md#block-3) | command | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | client-program | [published source](../../../examples/solana/metadata-published/metadata.ts) |
| [5](published.md#block-5) | client-program | [published source](../../../examples/solana/metadata-published/read.ts) |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [solana/metadata](../../../solana/metadata)
- [solana/token-2022/run-local.sh](../../../solana/token-2022/run-local.sh)

## Reproduction setup

See [the exact-client setup guide](../../../examples/solana/metadata-published/README.md).
Only type-check these preserved clients by default: the creation client reads a
personal wallet and submits to devnet when executed. No article-runtime pass is claimed.
