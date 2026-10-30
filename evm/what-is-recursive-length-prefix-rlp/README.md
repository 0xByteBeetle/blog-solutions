# What is Recursive-length prefix (RLP) serialization

[Read the article](https://andreyobruchkov1996.substack.com/p/what-is-recursive-length-prefix-rlp) · [Published examples](published.md)

Published blocks preserved. Execution coverage is incomplete; supplementary lab results are not article verification.

[Article-local setup and requirements](SETUP.md)

Article status: **source-restored**.

## Recovered source

- [evm/what-is-recursive-length-prefix-rlp/projects/rlp](projects/rlp)

## Recorded checks

- [evm/what-is-recursive-length-prefix-rlp/projects/rlp: unit-tested](../../verification/restored-evm-builds.json) (2026-10-30)

  Checked with: `go test ./...`

These results apply to the listed projects, not every block in the article. Build-only checks do not submit transactions.

## Example map

| Block | Type | Source |
| --- | --- | --- |
| [1](published.md#block-1) | program | Preserved excerpt; runnable implementation scope remains to be reviewed; [original repo variant](projects/rlp/encode/encode.go) |
| [2](published.md#block-2) | unit-tests | [published source](projects/rlp/encode/encode_test.go); [original repo variant](projects/rlp/encode/encode_test.go) |
| [3](published.md#block-3) | program | Preserved excerpt; runnable implementation scope remains to be reviewed; [original repo variant](projects/rlp/decode/decode.go) |
| [4](published.md#block-4) | unit-tests | [published source](projects/rlp/decode/decode_test.go); [original repo variant](projects/rlp/decode/decode_test.go) |

“Original repo variant” links preserve the author’s repository files byte-for-byte. They may differ from the printed excerpt; the published block remains the exact reference.

## Supplementary labs

These older topic-level labs are not substitutes for the published code.

- [evm/what-is-recursive-length-prefix-rlp/supplementary/go/rlpmanual](supplementary/go/rlpmanual)
