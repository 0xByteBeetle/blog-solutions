// Separate regression derived from the author test; original test remains unchanged.
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TransferHookProject } from "../target/types/transfer_hook_project";
import {
  TOKEN_2022_PROGRAM_ID,
  getAccount,
  createInitializeMintInstruction,
  createInitializeTransferHookInstruction,
  getMintLen,
  ExtensionType,
  createAccount,
  mintTo,
  transferCheckedWithTransferHook,
} from "@solana/spl-token";
import assert from "node:assert/strict";

describe("transfer-hook-project", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.TransferHookProject as Program<TransferHookProject>;

  const connection = provider.connection;
  const mint = anchor.web3.Keypair.generate();
  const decimals = 9;

  // Keypairs for the transfer
  const source = anchor.web3.Keypair.generate();
  const destination = anchor.web3.Keypair.generate();

  it("Setup Mint and Hook", async () => {
    const mintLen = getMintLen([ExtensionType.TransferHook]);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    const transaction = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeTransferHookInstruction(
        mint.publicKey,
        wallet.publicKey,
        program.programId,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        mint.publicKey,
        decimals,
        wallet.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      )
    );

    await anchor.web3.sendAndConfirmTransaction(connection, transaction, [wallet.payer, mint]);

    // Initialize the ExtraAccountMetaList PDA
    const [extraMetasPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("extra-account-metas"), mint.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeExtraAccountMetaList()
      .accounts({
        mint: mint.publicKey,
        extraMetasAccount: extraMetasPDA,
      })
      .rpc();
  });

  it("Test Transfer Hook Logic", async () => {
    // 1. Create Token Accounts
    const sourceATA = await createAccount(connection, wallet.payer, mint.publicKey, wallet.publicKey, undefined, undefined, TOKEN_2022_PROGRAM_ID);
    const destinationATA = await createAccount(connection, wallet.payer, mint.publicKey, anchor.web3.Keypair.generate().publicKey, undefined, undefined, TOKEN_2022_PROGRAM_ID);

    // 2. Mint 2,000 tokens
    const mintAmount = BigInt(2000 * 10 ** decimals);
    await mintTo(connection, wallet.payer, mint.publicKey, sourceATA, wallet.publicKey, mintAmount, [], undefined, TOKEN_2022_PROGRAM_ID);

    // 3. Try to transfer 1,500 tokens (Should FAIL based on our 1,000 limit)
    const failAmount = BigInt(1500 * 10 ** decimals);
    console.log("Attempting 'Whale' transfer (1500 tokens)... should fail.");

    await assert.rejects(async () => {
      await transferCheckedWithTransferHook(
        connection,
        wallet.payer,
        sourceATA,
        mint.publicKey,
        destinationATA,
        wallet.publicKey,
        failAmount,
        decimals,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID
      );
    }, (error: any) => /AmountTooBig|custom program error: 0x1770/.test(String(error) + "\n" + (error.logs || []).join("\n")));
    assert.equal((await getAccount(connection, sourceATA, undefined, TOKEN_2022_PROGRAM_ID)).amount, mintAmount);
    assert.equal((await getAccount(connection, destinationATA, undefined, TOKEN_2022_PROGRAM_ID)).amount, 0n);
    console.log("Verified oversized transfer rejected with the hook error; both balances unchanged.");

    // 4. Try to transfer 500 tokens (Should PASS)
    const passAmount = BigInt(500 * 10 ** decimals);
    console.log("Attempting 'Normal' transfer (500 tokens)... should pass.");

    await transferCheckedWithTransferHook(
      connection,
      wallet.payer,
      sourceATA,
      mint.publicKey,
      destinationATA,
      wallet.publicKey,
      passAmount,
      decimals,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    assert.equal((await getAccount(connection, sourceATA, undefined, TOKEN_2022_PROGRAM_ID)).amount, mintAmount - passAmount);
    assert.equal((await getAccount(connection, destinationATA, undefined, TOKEN_2022_PROGRAM_ID)).amount, passAmount);
    console.log("Verified 500-token transfer: source=1500, destination=500.");
  });
});
