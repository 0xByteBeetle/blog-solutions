// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { BorshDeepDive } from "../target/types/borsh_deep_dive";
// import { Keypair } from "@solana/web3.js";
// import { expect } from "chai";

// describe("borsh_deep_dive", () => {
//   const provider = anchor.AnchorProvider.env();
//   anchor.setProvider(provider);
//   const program = anchor.workspace.BorshDeepDive as Program<BorshDeepDive>;

//   it("Initializes and prints the raw byte array!", async () => {
//     const profileKeypair = Keypair.generate();
//     const age = 25;
//     const balance = new anchor.BN(1000); // 1000 in little-endian

//     // 1. Execute the transaction
//     await program.methods
//       .initializeProfile(age, balance)
//       .accounts({
//         userProfile: profileKeypair.publicKey,
//         user: provider.wallet.publicKey,
//         systemProgram: anchor.web3.SystemProgram.programId,
//       })
//       .signers([profileKeypair])
//       .rpc();

//     // 2. Fetch the RAW account info directly from the RPC
//     const accountInfo = await provider.connection.getAccountInfo(
//       profileKeypair.publicKey
//     );

//     // 3. Print the raw Buffer as an array of decimal integers
//     const rawBytes = Array.from(accountInfo.data);
//     console.log("Raw Account Buffer:", rawBytes);

//     // Let's also print it in Hex to see it clearly
//     console.log("Hex Representation:", accountInfo.data.toString("hex"));
//   });
// });

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BorshDeepDive } from "../target/types/borsh_deep_dive";
import { Keypair, SystemProgram } from "@solana/web3.js";

describe("borsh_deep_dive", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.BorshDeepDive as Program<BorshDeepDive>;

  it("Reveals the hidden Borsh prefixes!", async () => {
    const proposalKeypair = Keypair.generate();

    // Our dynamic test data
    const active = true; // Maps to Some(true)
    const title = "GM";
    const voters = [SystemProgram.programId]; // 1 pubkey (32 bytes of zeros)

    await program.methods
      .initializeProposal(active, title, voters)
      .accounts({
        proposal: proposalKeypair.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([proposalKeypair])
      .rpc();

    // Fetch the RAW account buffer
    const accountInfo = await provider.connection.getAccountInfo(
      proposalKeypair.publicKey
    );

    console.log("Raw Dynamic Buffer:", Array.from(accountInfo.data));
  });
});