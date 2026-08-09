import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { AccountsLab } from "../target/types/accounts_lab";

describe("accounts and PDAs", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.AccountsLab as Program<AccountsLab>;
  const authority = provider.wallet.publicKey;
  const [userPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("user"), authority.toBuffer()],
    program.programId,
  );

  it("creates a deterministic user PDA with stored owner and bump", async () => {
    await program.methods.createUser("andrey").rpc();

    const user = await program.account.userAccount.fetch(userPda);
    expect(user.owner.equals(authority)).to.equal(true);
    expect(user.name).to.equal("andrey");
    expect(user.bump).to.equal(bump);
    expect(user.createdAt.toNumber()).to.be.greaterThan(0);
  });

  it("rejects a value larger than the allocated UTF-8 byte budget", async () => {
    try {
      await program.methods.updateName("🪲".repeat(9)).rpc();
      expect.fail("the update should reject 36 UTF-8 bytes");
    } catch (error) {
      expect(String(error)).to.include("longer than 32 UTF-8 bytes");
    }
  });

  it("updates and then closes the PDA", async () => {
    await program.methods.updateName("0xByteBeetle").rpc();
    expect((await program.account.userAccount.fetch(userPda)).name).to.equal(
      "0xByteBeetle",
    );

    await program.methods.closeUser().rpc();
    expect(await provider.connection.getAccountInfo(userPda)).to.equal(null);
  });
});
