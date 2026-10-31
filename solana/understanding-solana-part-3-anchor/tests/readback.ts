// Supplemental equivalent of the article's create/update/closed client readbacks.
import * as anchor from "@coral-xyz/anchor";
import assert from "node:assert/strict";

describe("article state readbacks", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.solanaAccounts;
  const owner = provider.wallet.publicKey;
  const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("user"), owner.toBuffer()], program.programId);
  it("checks PDA identity, fields, updated state and actual absence after close", async () => {
    await program.methods.createUser("andrey").accounts({authority: owner}).rpc({commitment: "confirmed", preflightCommitment: "confirmed"});
    const created = await program.account.userAccount.fetch(pda, "confirmed");
    const raw = await provider.connection.getAccountInfo(pda, "confirmed");
    assert.ok(raw && raw.owner.equals(program.programId));
    assert.ok(created.owner.equals(owner));
    assert.equal(created.name, "andrey");
    assert.equal(created.bump, bump);
    assert.ok(created.createdAt.toNumber() > 0);
    await program.methods.updateName("bytebeetle").accounts({authority: owner}).rpc({commitment: "confirmed", preflightCommitment: "confirmed"});
    const updated = await program.account.userAccount.fetch(pda, "confirmed");
    assert.equal(updated.name, "bytebeetle");
    assert.ok(updated.owner.equals(owner));
    assert.equal(updated.createdAt.toString(), created.createdAt.toString());
    await program.methods.closeUser().accounts({authority: owner}).rpc({commitment: "confirmed", preflightCommitment: "confirmed"});
    assert.equal(await provider.connection.getAccountInfo(pda, "confirmed"), null);
    assert.equal(await program.account.userAccount.fetchNullable(pda, "confirmed"), null);
  });
});
