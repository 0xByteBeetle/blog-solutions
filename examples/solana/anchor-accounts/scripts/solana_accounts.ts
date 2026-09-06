import * as anchor from "@coral-xyz/anchor";
import type { Program } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { SolanaAccounts } from "../target/types/solana_accounts";

async function ensureAirdrop(connection: anchor.web3.Connection, pubkey: PublicKey, min = 2 * LAMPORTS_PER_SOL) {
  const bal = await connection.getBalance(pubkey);
  if (bal >= min) return;
  const sig = await connection.requestAirdrop(pubkey, min);
  await connection.confirmTransaction(sig, "confirmed");
}

(async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Use Anchor workspace (uses generated IDL/types under target/)
  const program = anchor.workspace.solanaAccounts as Program<SolanaAccounts>;
  const wallet = provider.wallet as anchor.Wallet;

  // Make sure we have SOL (useful on localhost)
  try { await ensureAirdrop(provider.connection, wallet.publicKey); } catch {}

  // PDA: seeds = ["user", authority]
  // Seeds must match the program’s #[account(seeds = [b"user", authority])]. From Rust!
  const [userPda] = PublicKey.findProgramAddressSync([Buffer.from("user"), wallet.publicKey.toBuffer()], program.programId);

  console.log("Wallet:", wallet.publicKey.toBase58());
  console.log("Program:", program.programId.toBase58());
  console.log("User PDA:", userPda.toBase58());

  // 1) createUser
  //    Derivable accounts (PDAs) are autofilled by Anchor
  //    No need to pass programId or PDA here! it knows from the context.
  const sig1 = await program.methods
    .createUser("0xByteBeetle")
    .accounts({ authority: wallet.publicKey }) // derivable accounts are autofilled
    .rpc();
  console.log("createUser tx:", sig1);

  // Fethch and log the created account
  const acct1 = await program.account.userAccount.fetch(userPda);
  console.log("After create:", {
    owner: acct1.owner.toBase58(),
    name: acct1.name,
    created_at: new Date(acct1.createdAt.toNumber() * 1000).toISOString(),
    bump: acct1.bump,
  });

  // 2) updateName
  const sig2 = await program.methods
    .updateName("bytebeetle")
    .accounts({ authority: wallet.publicKey })
    .rpc();
  console.log("updateName tx:", sig2);

  const acct2 = await program.account.userAccount.fetch(userPda);
  console.log("After update:", { name: acct2.name });

  // 3) closeUser
  const sig3 = await program.methods
    .closeUser()
    .accounts({ authority: wallet.publicKey })
    .rpc();
  console.log("closeUser tx:", sig3);

  try {
    await program.account.userAccount.fetch(userPda);
  } catch {
    console.log("PDA closed (fetch failed as expected).");
  }

  console.log("Done ✅");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
