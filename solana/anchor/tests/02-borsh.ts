import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { createHash } from "node:crypto";
import { BorshLab } from "../types/borsh_lab";

const discriminator = (accountName: string): Buffer =>
  createHash("sha256").update(`account:${accountName}`).digest().subarray(0, 8);

describe("Borsh account bytes", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.BorshLab as Program<BorshLab>;

  it("writes a u8 followed by a little-endian u64", async () => {
    const profile = anchor.web3.Keypair.generate();
    await program.methods
      .initializeProfile(25, new anchor.BN(1_000))
      .accounts({ profile: profile.publicKey })
      .signers([profile])
      .rpc();

    const data = Buffer.from(
      (await provider.connection.getAccountInfo(profile.publicKey))!.data,
    );
    expect(data.subarray(0, 8).equals(discriminator("UserProfile"))).to.equal(
      true,
    );
    expect(data[8]).to.equal(25);
    expect(data.readBigUInt64LE(9)).to.equal(1_000n);
  });

  it("reveals Option, String, and Vec length prefixes", async () => {
    const proposal = anchor.web3.Keypair.generate();
    const voter = anchor.web3.SystemProgram.programId;
    await program.methods
      .initializeProposal(true, "GM", [voter])
      .accounts({ proposal: proposal.publicKey })
      .signers([proposal])
      .rpc();

    const data = Buffer.from(
      (await provider.connection.getAccountInfo(proposal.publicKey))!.data,
    );
    let offset = 8;
    expect([...data.subarray(offset, offset + 2)]).to.deep.equal([1, 1]);
    offset += 2;
    expect(data.readUInt32LE(offset)).to.equal(2);
    offset += 4;
    expect(data.subarray(offset, offset + 2).toString("utf8")).to.equal("GM");
    offset += 2;
    expect(data.readUInt32LE(offset)).to.equal(1);
    offset += 4;
    expect(data.subarray(offset, offset + 32).equals(voter.toBuffer())).to.equal(
      true,
    );
  });
});
