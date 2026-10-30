import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaAccounts } from "../target/types/solana_accounts";

describe("solana_accounts", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.solanaAccounts as Program<SolanaAccounts>;
  const wallet = provider.wallet as anchor.Wallet;

  // Derive the PDA: seeds = ["user", authority_pubkey]
  const [userPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user"), wallet.publicKey.toBuffer()],
    program.programId
  );

  it("creates the user PDA", async () => {
    const txSig = await program.methods
      .createUser("andrey")               // <-- your arg
      .accounts({
        authority: wallet.publicKey,
        // systemProgram and clock sysvar are auto-filled by Anchor client
      })
      .rpc();

    console.log("createUser tx:", txSig);
  });

  it("updates the name", async () => {
    const txSig = await program.methods
      .updateName("bytebeetle")
      .accounts({
        authority: wallet.publicKey,
      })
      .rpc();

    console.log("updateName tx:", txSig);
  });

  it("closes the user account", async () => {
    const txSig = await program.methods
      .closeUser()
      .accounts({
        authority: wallet.publicKey,
      })
      .rpc();

    console.log("closeUser tx:", txSig);
  });
});
