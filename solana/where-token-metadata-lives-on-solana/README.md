# Where Token Metadata Lives on Solana: From Convention to Explicit Data

[Read the article](https://andreyobruchkov1996.substack.com/p/where-token-metadata-lives-on-solana) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [solana/where-token-metadata-lives-on-solana/projects/metadata-published](projects/metadata-published)

  Run: `npm ci --ignore-scripts && npm run check`

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | command | Reference/command/output preserved; no standalone program implied |
| [2](published.md#block-2) | command | Reference/command/output preserved; no standalone program implied |
| [3](published.md#block-3) | command | Reference/command/output preserved; no standalone program implied |
| [4](published.md#block-4) | client-program | [published source](projects/metadata-published/metadata.ts) |
| [5](published.md#block-5) | client-program | [published source](projects/metadata-published/read.ts) |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [solana/where-token-metadata-lives-on-solana/supplementary/metadata](supplementary/metadata)
- [solana/where-token-metadata-lives-on-solana/supplementary/token-2022/run-local.sh](supplementary/token-2022/run-local.sh)
