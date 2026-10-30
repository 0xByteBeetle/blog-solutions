import {
  createMetadataAccountV3,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";

import { createWalletUmi, requiredEnvironment } from "./client.js";

const rpcUrl = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const walletPath = requiredEnvironment("SOLANA_KEYPAIR");
const mint = publicKey(requiredEnvironment("MINT_ADDRESS"));
const umi = createWalletUmi(rpcUrl, walletPath).use(mplTokenMetadata());

const result = await createMetadataAccountV3(umi, {
  mint,
  mintAuthority: umi.identity,
  payer: umi.identity,
  updateAuthority: umi.identity.publicKey,
  data: {
    name: process.env.TOKEN_NAME ?? "Example Token",
    symbol: process.env.TOKEN_SYMBOL ?? "EXMPL",
    uri: process.env.TOKEN_URI ?? "https://example.com/metadata.json",
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  },
  isMutable: true,
  collectionDetails: null,
}).sendAndConfirm(umi);

console.log("Metadata transaction signature (bytes):", Array.from(result.signature));
