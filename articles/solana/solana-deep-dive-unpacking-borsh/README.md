# Solana Deep Dive: Unpacking Borsh Serialization Under the Hood

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/solana-deep-dive-unpacking-borsh)

Published: 2026-07-22

The article contains 13 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### Fixed and dynamic Borsh layouts inspected from raw account buffers

Code: `solana/anchor/programs/borsh_lab`

Run:

```bash
cd solana/anchor && ./scripts/test.sh
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
