# Published examples

Source: https://andreyobruchkov1996.substack.com/p/where-token-metadata-lives-on-solana

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `6896fec4314341cf289270830adf8f8fadb4497ec31be523997cddce049948b1`

````text
spl-token create-token --decimals 9
````

## Block 2

SHA-256: `e27426109f672241325912926ffa4a28e274361354fcb35bedeca1eca1e2c400`

````text
spl-token create-account H3NmgE4YBxzkNY94vV7z6UpHQaWse7VhQeYYrnHr3g5D
````

## Block 3

SHA-256: `a55535f2910acd051ac9a0bf4905625f869eccf437c2d2a76861a7547cd34400`

````text
spl-token mint H3NmgE4YBxzkNY94vV7z6UpHQaWse7VhQeYYrnHr3g5D 1000
````

## Block 4

SHA-256: `ad52f9afde30ab8c2dfaad336afc831cbe50a7d9df7b0425f3118fa820bf1cd9`

````text
import { createMetadataAccountV3 } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity, createSignerFromKeypair } from "@metaplex-foundation/umi";
import { publicKey } from "@metaplex-foundation/umi-public-keys";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const keypairPath = path.join(os.homedir(), ".config", "solana", "id.json");

const secretKey = JSON.parse(fs.readFileSync(keypairPath, "utf8"));

const mint = "H3NmgE4YBxzkNY94vV7z6UpHQaWse7VhQeYYrnHr3g5D";

async function main() {
  // Create UMI instance
  const umi = createUmi("https://api.devnet.solana.com");

  // Set up the keypair identity
  const keypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(secretKey)
  );
  umi.use(keypairIdentity(keypair));

  // Create signer from keypair
  const mintAuthoritySigner = createSignerFromKeypair(umi, keypair);

  // Create metadata account
  const tx = createMetadataAccountV3(umi, {
    mint: publicKey(mint),
    mintAuthority: mintAuthoritySigner,
    data: {
      name: "Example Token",
      symbol: "EXMPL",
      uri: "https://example.com/metadata.json",
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: true,
    collectionDetails: null,
  });

  const signature = await tx.sendAndConfirm(umi);
  console.log("Transaction signature:", signature);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

````

## Block 5

SHA-256: `328da9f66525530e16c4094de2e7970cd8f90037586bb5d8d9b24228b9a93976`

````text
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
````
