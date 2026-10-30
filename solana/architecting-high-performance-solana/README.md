# Architecting High-Performance Solana Programs: The Zero-Copy Deep Dive

[Read the article](https://andreyobruchkov1996.substack.com/p/architecting-high-performance-solana) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [solana/architecting-high-performance-solana/projects/zero-copy-original](projects/zero-copy-original)
- [solana/architecting-high-performance-solana/projects/zero-copy](projects/zero-copy)

  Run: `node scripts/run-original-anchor.mjs zero-copy`
- [solana/architecting-high-performance-solana/projects/zero-copy-layout](projects/zero-copy-layout)

  Run: `cargo test --manifest-path solana/architecting-high-performance-solana/projects/zero-copy-layout/Cargo.toml -- --nocapture`

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | struct-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [2](published.md#block-2) | test-program | [published source](projects/zero-copy-layout/src/lib.rs) |
| [3](published.md#block-3) | instruction-fragment | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [4](published.md#block-4) | intentional-failure | Preserved excerpt; runnable implementation scope remains to be reviewed |
| [5](published.md#block-5) | program | [published source](projects/zero-copy/programs/zero_copy_deep_dive/src/lib.rs) |
| [6](published.md#block-6) | integration-test | [published source](projects/zero-copy/tests/published.ts) |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [solana/architecting-high-performance-solana/supplementary/fundamentals](supplementary/fundamentals)
