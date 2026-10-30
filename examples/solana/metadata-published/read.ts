import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi-public-keys";
import { fetchDigitalAsset } from "@metaplex-foundation/mpl-token-metadata";

const MINT_ADDRESS = "H3NmgE4YBxzkNY94vV7z6UpHQaWse7VhQeYYrnHr3g5D";

const RPC_URL = "https://api.devnet.solana.com";

async function main() {
  console.log("Checking metadata for mint:", MINT_ADDRESS);

  // Create UMI instance
  const umi = createUmi(RPC_URL);

  try {
    // Fetch the digital asset (mint + metadata + edition info)
    const mint = publicKey(MINT_ADDRESS);
    const digitalAsset = await fetchDigitalAsset(umi, mint);

    const metadata = digitalAsset.metadata;

    console.log("\nMetadata found!");
    console.log("\nToken Metadata:");
    console.log("─".repeat(50));
    console.log("Name:                ", metadata.name);
    console.log("Symbol:              ", metadata.symbol);
    console.log("URI:                 ", metadata.uri);
    console.log("Seller Fee (bps):    ", metadata.sellerFeeBasisPoints);
    console.log("Is Mutable:          ", metadata.isMutable);
    console.log("Update Authority:    ", metadata.updateAuthority);
    console.log("\n Mint Info:");
    console.log("Mint Address:        ", digitalAsset.mint.publicKey);
    console.log("Decimals:            ", digitalAsset.mint.decimals);
    console.log("Supply:              ", digitalAsset.mint.supply);
    console.log("Mint Authority:      ", digitalAsset.mint.mintAuthority);
    console.log("Freeze Authority:    ", digitalAsset.mint.freezeAuthority);
  } catch (error) {
    if (error.message?.includes("Account Not Found")) {
      console.log("\n No metadata found for this token mint");
      console.log("The token exists but doesn't have metadata associated with it yet");
      console.log("Use metadata.ts to create metadata for this token");
    } else {
      throw error;
    }
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});