# RLP boundary-corrected variant

See [provenance, changes, scope, and run commands](../README.md). These files are
supplemental variants of the preserved `../../rlp` implementation, not author-source.

The fixed-width integer tests include `2^31`, `2^63`, and `2^64-1`; framing tests
reject trailing bytes, oversized declared payloads, and truncated length prefixes.

`encode/original_vectors_test.go` and `decode/original_vectors_test.go` are unchanged
copies of the recovered original repository's corresponding `*_test.go` files,
revision `2dbcdaa835fc4e2fd64eea3a16303db2ba6f78d0`, retained here to run its existing
vectors against the corrected variant as well. `boundaries_test.go` files are new.
