import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createAccount,
  createInitializeMintInstruction,
  createInitializeTransferHookInstruction,
  getAccount,
  getMintLen,
  mintTo,
  transferCheckedWithTransferHook,
} from "@solana/spl-token";
import { TransferHook } from "../types/transfer_hook";

describe("Token-2022 transfer hook", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.TransferHook as Program<TransferHook>;
  const mint = anchor.web3.Keypair.generate();
  let source: anchor.web3.PublicKey;
  let destination: anchor.web3.PublicKey;

  it("creates a mint, token accounts, and the required empty meta-list PDA", async () => {
    const mintLen = getMintLen([ExtensionType.TransferHook]);
    const lamports =
      await provider.connection.getMinimumBalanceForRentExemption(mintLen);
    const createMint = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        lamports,
        space: mintLen,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeTransferHookInstruction(
        mint.publicKey,
        wallet.publicKey,
        program.programId,
        TOKEN_2022_PROGRAM_ID,
      ),
      createInitializeMintInstruction(
        mint.publicKey,
        0,
        wallet.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID,
      ),
    );
    await provider.sendAndConfirm(createMint, [mint]);

    source = await createAccount(
      provider.connection,
      wallet.payer,
      mint.publicKey,
      wallet.publicKey,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
    destination = await createAccount(
      provider.connection,
      wallet.payer,
      mint.publicKey,
      anchor.web3.Keypair.generate().publicKey,
      undefined,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
    await mintTo(
      provider.connection,
      wallet.payer,
      mint.publicKey,
      source,
      wallet.publicKey,
      2_000n,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );

    await program.methods
      .initializeExtraAccountMetaList()
      .accounts({ mint: mint.publicKey })
      .rpc();
  });

  it("rejects 1,500 base units without changing balances", async () => {
    const beforeSource = await getAccount(
      provider.connection,
      source,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
    try {
      await transferCheckedWithTransferHook(
        provider.connection,
        wallet.payer,
        source,
        mint.publicKey,
        destination,
        wallet.publicKey,
        1_500n,
        0,
        [],
        undefined,
        TOKEN_2022_PROGRAM_ID,
      );
      expect.fail("the hook should reject a transfer above its limit");
    } catch (error) {
      expect(String(error)).to.not.include(
        "the hook should reject a transfer above its limit",
      );
    }
    const afterSource = await getAccount(
      provider.connection,
      source,
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
    expect(afterSource.amount).to.equal(beforeSource.amount);
  });

  it("allows 500 base units and updates both balances", async () => {
    await transferCheckedWithTransferHook(
      provider.connection,
      wallet.payer,
      source,
      mint.publicKey,
      destination,
      wallet.publicKey,
      500n,
      0,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID,
    );
    expect(
      (
        await getAccount(
          provider.connection,
          source,
          undefined,
          TOKEN_2022_PROGRAM_ID,
        )
      ).amount,
    ).to.equal(1_500n);
    expect(
      (
        await getAccount(
          provider.connection,
          destination,
          undefined,
          TOKEN_2022_PROGRAM_ID,
        )
      ).amount,
    ).to.equal(500n);
  });
});
