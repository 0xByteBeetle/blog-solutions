import {
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";

import { createWalletUmi, requiredEnvironment } from "./client.js";

const rpcUrl = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const walletPath = requiredEnvironment("SOLANA_KEYPAIR");
const mint = publicKey(requiredEnvironment("MINT_ADDRESS"));
const umi = createWalletUmi(rpcUrl, walletPath).use(mplTokenMetadata());
const asset = await fetchDigitalAsset(umi, mint);

console.log({
  mint: asset.mint.publicKey,
  decimals: asset.mint.decimals,
  supply: asset.mint.supply,
  name: asset.metadata.name,
  symbol: asset.metadata.symbol,
  uri: asset.metadata.uri,
  isMutable: asset.metadata.isMutable,
  updateAuthority: asset.metadata.updateAuthority,
});
