# Architecting High-Performance Solana Programs: The Zero-Copy Deep Dive

[Read the article](https://andreyobruchkov1996.substack.com/p/architecting-high-performance-solana) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

Article status: **source-restored**.

## Recovered source

- [examples/solana/zero-copy-original](../../../examples/solana/zero-copy-original)
- [examples/solana/zero-copy](../../../examples/solana/zero-copy)

  Run: `node scripts/run-original-anchor.mjs zero-copy`
- [examples/solana/zero-copy-layout](../../../examples/solana/zero-copy-layout)

  Run: `cargo test --manifest-path examples/solana/zero-copy-layout/Cargo.toml -- --nocapture`

## Recorded checks

- [examples/solana/zero-copy-layout: unit-tested](../../../verification/restored-builds.json) (2026-09-06)

  Checked with: `cargo test --locked -- --nocapture`
- [examples/solana/zero-copy-original: runtime-verified](../../../verification/zero-copy-original.json) (2026-09-06)

  Checked with: `node scripts/run-original-anchor.mjs zero-copy-original`
- [examples/solana/zero-copy: runtime-verified](../../../verification/zero-copy.json) (2026-09-06)

  Checked with: `node scripts/run-original-anchor.mjs zero-copy`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | struct-fragment | Preserved in the published block; runnable mapping pending |
| [2](published.md#block-2) | test-program | [published source](../../../examples/solana/zero-copy-layout/src/lib.rs) |
| [3](published.md#block-3) | instruction-fragment | Preserved in the published block; runnable mapping pending |
| [4](published.md#block-4) | intentional-failure | Preserved in the published block; runnable mapping pending |
| [5](published.md#block-5) | program | [published source](../../../examples/solana/zero-copy/programs/zero_copy_deep_dive/src/lib.rs) |
| [6](published.md#block-6) | integration-test | [published source](../../../examples/solana/zero-copy/tests/published.ts) |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [solana/fundamentals](../../../solana/fundamentals)
