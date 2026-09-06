import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BorshDeepDive } from "../target/types/borsh_deep_dive";
import { Keypair } from "@solana/web3.js";

describe("borsh_deep_dive", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.BorshDeepDive as Program<BorshDeepDive>;

  it("Initializes and prints the raw byte array!", async () => {
    const profileKeypair = Keypair.generate();
    const age = 25;
    const balance = new anchor.BN(1000); 

    // Execute the transaction
    await program.methods
      .initializeProfile(age, balance)
      .accounts({
        userProfile: profileKeypair.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([profileKeypair])
      .rpc();

    // Fetch the RAW account info directly from the RPC
    const accountInfo = await provider.connection.getAccountInfo(
      profileKeypair.publicKey
    );

    // Print the raw Buffer as an array of decimal integers
    console.log("Raw Account Buffer:", Array.from(accountInfo.data));
  });
});
