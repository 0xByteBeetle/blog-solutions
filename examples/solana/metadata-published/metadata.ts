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
