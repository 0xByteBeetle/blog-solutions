import * as anchor from "@coral-xyz/anchor";
import {
  AddressLookupTableProgram,
  PublicKey,
} from "@solana/web3.js";
import fs from "fs";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const payer = provider.wallet;

  const slot = await connection.getSlot("confirmed");

  const [createIx, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: payer.publicKey,
      payer: payer.publicKey,
      recentSlot: slot,
    });

  const tx = new anchor.web3.Transaction().add(createIx);
  const sig = await provider.sendAndConfirm(tx, []);

  console.log("ALT created");
  console.log("sig:", sig);
  console.log("lookupTableAddress:", lookupTableAddress.toBase58());

  fs.writeFileSync(
    "alt.json",
    JSON.stringify({ lookupTableAddress: lookupTableAddress.toBase58() }, null, 2),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
