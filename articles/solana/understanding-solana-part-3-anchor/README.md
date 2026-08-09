# Understanding Solana - Part 3: Anchor Accounts, Seeds, Bumps, PDAs, and How the Client Really Works

[Read the article on Substack](https://andreyobruchkov1996.substack.com/p/understanding-solana-part-3-anchor)

Published: 2025-11-18

The article contains 15 displayed code or output blocks. This page maps those examples to maintained implementations and checks; it does not duplicate the article itself.

## Companion implementation

### PDA creation, byte-bounded names, ownership constraints, updates, and account closure

Code: `solana/anchor/programs/accounts`

Run:

```bash
cd solana/anchor && ./scripts/test.sh
```

## Verification boundary

The mapped deterministic tests or disposable local-chain scenario passed on 9 August 2026.
