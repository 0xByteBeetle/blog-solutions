# What is Recursive-length prefix (RLP) serialization

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/what-is-recursive-length-prefix-rlp)

Published: 2025-11-08

The article contains 4 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### Canonical RLP strings, lists, integers, malformed inputs, and trailing-data checks

Code: `evm/go/rlpmanual`

Run:

```bash
cd evm/go && go test ./rlpmanual
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
