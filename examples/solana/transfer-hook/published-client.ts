import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TransferHookProject } from "../target/types/transfer_hook_project";

async function main() {
    // 1. Force the provider to use Devnet
    process.env.ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    // 2. Define your specific Devnet addresses
    const programId = new anchor.web3.PublicKey("<ProgramID>");
    const mintAddress = new anchor.web3.PublicKey("<MintID>");

    console.log("Connecting to Devnet as:", provider.wallet.publicKey.toBase58());

    // 3. Load the workspace program
    const program = anchor.workspace.TransferHookProject as Program<TransferHookProject>;

    // 4. Deterministically derive the PDA using the exact Token-2022 seeds
    // Only for the print, not needed for the program its done automatically.
    const [extraMetasPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("extra-account-metas"), mintAddress.toBuffer()],
        programId
    );

    console.log("Target Mint:", mintAddress.toBase58());
    console.log("Derived Metadata PDA:", extraMetasPDA.toBase58());
    console.log("Broadcasting initialization transaction...");

    // 5. Execute the Anchor instruction
    try {
        const tx = await program.methods
            .initializeExtraAccountMetaList()
            .accounts({
                mint: mintAddress,
            })
            .rpc();

        console.log("\nSuccess! The ExtraAccountMetaList roadmap is live on Devnet.");
        console.log(`View on Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    } catch (error) {
        console.error("Transaction failed:", error);
    }
}

main();
