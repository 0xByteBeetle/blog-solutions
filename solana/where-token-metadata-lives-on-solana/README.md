# Token metadata clients

[Article](https://andreyobruchkov1996.substack.com/p/where-token-metadata-lives-on-solana)

The two TypeScript files are the article's metadata creation and read examples. They contain historical endpoints/addresses and wallet-dependent operations; type-checking does not execute them.

```sh
npm ci --ignore-scripts
npm run check
```

Requires Node and the pinned TypeScript/Metaplex dependencies in package-lock.json. Review credentials, addresses and network before separately authorizing any creation transaction. No key or wallet is included.
