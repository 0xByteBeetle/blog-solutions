# Solana metadata companion

This project keeps the Metaplex examples from “Where Token Metadata Lives on Solana” as real TypeScript files instead of disconnected snippets.

The automated test derives the canonical metadata PDA and builds the exact `CreateMetadataAccountV3` instruction offline. This checks the account wiring and serialized instruction without requiring a funded wallet.

```bash
npm install
npm test
npm run check
```

The two network scripts are intentionally explicit about their inputs. They never read the default wallet implicitly.

```bash
export SOLANA_RPC_URL=https://api.devnet.solana.com
export SOLANA_KEYPAIR=/absolute/path/to/devnet-only-keypair.json
export MINT_ADDRESS=<mint whose authority matches the keypair>

npm run create
npm run read
```

`create.ts` creates the metadata PDA for an existing classic SPL mint. `read.ts` fetches the mint and metadata account as one digital asset and prints the important fields. Use a devnet-only keypair; never commit it.
