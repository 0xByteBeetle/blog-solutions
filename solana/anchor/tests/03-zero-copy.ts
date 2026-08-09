import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { ZeroCopy } from "../target/types/zero_copy";

describe("zero-copy layouts", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.ZeroCopy as Program<ZeroCopy>;
  const authority = provider.wallet as anchor.Wallet;

  it("maps and updates the small explicitly padded market", async () => {
    const market = anchor.web3.Keypair.generate();
    await program.methods
      .initializeMarket()
      .accounts({ market: market.publicKey })
      .signers([market])
      .rpc();
    await program.methods
      .updateVolume(new anchor.BN(500))
      .accounts({ market: market.publicKey })
      .rpc();

    const state = await program.account.marketState.fetch(market.publicKey);
    expect(state.version).to.equal(1);
    expect(state.totalVolume.toNumber()).to.equal(500);
    expect(state.isActive).to.equal(1);
    expect(state.authority.equals(authority.publicKey)).to.equal(true);
  });

  it("uses external creation before load_init for an account larger than 10 KB", async () => {
    const canvas = anchor.web3.Keypair.generate();
    const space = 8 + 32 + 8 + 10_240;
    const lamports =
      await provider.connection.getMinimumBalanceForRentExemption(space);

    const create = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: authority.publicKey,
        newAccountPubkey: canvas.publicKey,
        lamports,
        space,
        programId: program.programId,
      }),
    );
    await provider.sendAndConfirm(create, [canvas]);

    await program.methods
      .initializeLargeCanvas()
      .accounts({ canvas: canvas.publicKey })
      .rpc();
    await program.methods
      .drawPixel(1_024, 9)
      .accounts({ canvas: canvas.publicKey })
      .rpc();

    const state = await program.account.largeCanvas.fetch(canvas.publicKey);
    expect(state.admin.equals(authority.publicKey)).to.equal(true);
    expect(state.totalDrawn.toNumber()).to.equal(2);
    expect(state.pixels[0]).to.equal(5);
    expect(state.pixels[1_024]).to.equal(9);
  });
});
