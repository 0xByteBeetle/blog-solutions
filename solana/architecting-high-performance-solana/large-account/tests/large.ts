import * as anchor from '@coral-xyz/anchor';
import { expect } from 'chai';
const SPACE = 16448;
describe('supplemental external allocation / zero initialization', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.LargeZeroCopy;
    async function allocate(size = SPACE, owner = program.programId) {
        const market = anchor.web3.Keypair.generate();
        const lamports = await provider.connection.getMinimumBalanceForRentExemption(size);
        await provider.sendAndConfirm(new anchor.web3.Transaction().add(anchor.web3.SystemProgram.createAccount({ fromPubkey: provider.wallet.publicKey, newAccountPubkey: market.publicKey, lamports, space: size, programId: owner })), [market]);
        return market;
    }
    async function rejected(action: Promise<unknown>, code: string) {
        try {
            await action;
            throw new Error('unexpected success');
        }
        catch (error: any) {
            expect(error?.error?.errorCode?.code ?? ((error?.logs ?? []).join("\n") + String(error))).to.contain(code);
        }
    }
    it('allocates >10KiB first, then initializes owned zero data and updates in place', async () => {
        const market = await allocate();
        const before = await provider.connection.getAccountInfo(market.publicKey);
        expect(before!.data.length).eq(SPACE);
        expect(before!.owner.equals(program.programId)).eq(true);
        expect(before!.data.every(x => x === 0)).eq(true);
        await program.methods.initialize().accounts({ market: market.publicKey, authority: provider.wallet.publicKey }).signers([market]).rpc();
        let account = await program.account.largeMarket.fetch(market.publicKey);
        expect(account.authority.equals(provider.wallet.publicKey)).eq(true);
        expect(account.version.toNumber()).eq(1);
        expect(account.totalVolume.toNumber()).eq(0);
        expect(account.isActive.toNumber()).eq(1);
        await program.methods.updateVolume(new anchor.BN(500)).accounts({ market: market.publicKey, authority: provider.wallet.publicKey }).rpc();
        account = await program.account.largeMarket.fetch(market.publicKey);
        expect(account.totalVolume.toNumber()).eq(500);
        const after = await provider.connection.getAccountInfo(market.publicKey);
        expect(after!.data.length).eq(SPACE);
        expect(after!.data.subarray(64).every(x => x === 0)).eq(true);
        await rejected(program.methods.initialize().accounts({ market: market.publicKey, authority: provider.wallet.publicKey }).signers([market]).rpc(), 'ConstraintZero');
        const stranger = anchor.web3.Keypair.generate();
        await rejected(program.methods.updateVolume(new anchor.BN(1)).accounts({ market: market.publicKey, authority: stranger.publicKey }).signers([stranger]).rpc(), 'WrongAuthority');
    });
    it('requires the allocated account signature for initialization', async () => {
        const market = await allocate();
        const ix = await program.methods.initialize().accounts({ market: market.publicKey, authority: provider.wallet.publicKey }).instruction();
        ix.keys.find((x: any) => x.pubkey.equals(market.publicKey))!.isSigner = false;
        await rejected(provider.sendAndConfirm(new anchor.web3.Transaction().add(ix)), 'ConstraintSigner');
        const account = await provider.connection.getAccountInfo(market.publicKey);
        expect(account!.data.every(x => x === 0)).eq(true);
    });
    it('rejects undersized and oversized external allocations before mapping the buffer', async () => {
        for (const size of [10240, SPACE - 8, SPACE + 8]) {
            const market = await allocate(size);
            await rejected(program.methods.initialize().accounts({ market: market.publicKey, authority: provider.wallet.publicKey }).signers([market]).rpc(), 'WrongSize');
            const data = await provider.connection.getAccountInfo(market.publicKey);
            expect(data!.data.every(x => x === 0)).eq(true);
        }
    });
    it('rejects a System-owned buffer even when size and zero bytes match', async () => {
        const market = await allocate(SPACE, anchor.web3.SystemProgram.programId);
        await rejected(program.methods.initialize().accounts({ market: market.publicKey, authority: provider.wallet.publicKey }).signers([market]).rpc(), 'AccountOwnedByWrongProgram');
    });
});
