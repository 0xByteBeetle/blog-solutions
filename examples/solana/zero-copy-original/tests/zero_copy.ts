import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BorshDeepDive } from "../target/types/borsh_deep_dive";
import { expect } from "chai";

describe("zero_copy_deep_dive", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.BorshDeepDive as Program<BorshDeepDive>;

    it("Initializes and Updates the volume!", async () => {
        const marketKeypair = anchor.web3.Keypair.generate();

        console.log("Available methods:", Object.keys(program.methods));

        // Initialize the account
        // This creates the account and changes owner from SystemProgram to our Program
        await program.methods
            .initialize()
            .accounts({
                market: marketKeypair.publicKey,
                authority: provider.wallet.publicKey,
            })
            .signers([marketKeypair])
            .rpc();

        console.log("Account initialized.");

        // Update the volume
        // This will now pass because the account is owned by the program
        const updateAmount = new anchor.BN(500);
        await program.methods
            .updateVolume(updateAmount)
            .accounts({
                market: marketKeypair.publicKey,
                authority: provider.wallet.publicKey,
            })
            .rpc();

        // Verify
        const account = await program.account.marketState.fetch(marketKeypair.publicKey);
        console.log("On-chain Volume:", account.totalVolume.toString());

        expect(account.totalVolume.toNumber()).to.equal(500);
        expect(account.isActive).to.equal(1);
    });
});