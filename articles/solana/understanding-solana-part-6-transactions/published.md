# Published examples

Source: https://andreyobruchkov1996.substack.com/p/understanding-solana-part-6-transactions

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `9702c306fe1c2110a1bfe7e970440381cebf7b4ef8a046be8459f0251986fd2c`

````text
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::set_return_data, program_pack::Pack};
use anchor_spl::{token, token_2022};


declare_id!(”<YOUR-GENERATED-PROGRAM-ID>”);

fn ata_for_token(owner: &Pubkey, mint: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(&[owner.as_ref(), anchor_spl::token::ID.as_ref(), mint.as_ref()],
        &anchor_spl::associated_token::ID,           // Associated Token Program id
    ).0
}

fn ata_for_token22(owner: &Pubkey, mint: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(&[owner.as_ref(), anchor_spl::token_2022::ID.as_ref(), mint.as_ref()],
        &anchor_spl::associated_token::ID,           // Associated Token Program id
    ).0
}

#[program]
pub mod wallet_token_balances {
    use super::*;

    pub fn get_balances(ctx: Context<GetBalances>, wallet_mints: Vec<WalletMints>) -> Result<()> {
        // Build output: Vec<Balance> (wallet, mint, amount)
        let mut out: Vec<Balance> = Vec::new();

        // Map remaining accounts for quick lookup
        use std::collections::HashMap;
        let mut rem: HashMap<Pubkey, &AccountInfo> = HashMap::with_capacity(ctx.remaining_accounts.len());
        for ai in ctx.remaining_accounts.iter() {
            rem.insert(*ai.key, ai);
        }

        // For each wallet and its mint list
        for wm in wallet_mints.iter() {
            for mint in wm.mints.iter() {
                // let ata = get_associated_token_address(&wm.wallet, mint);

                let ata_v1  = ata_for_token(&wm.wallet, mint);
                let ata_v22 = ata_for_token22(&wm.wallet, mint);

                // Prefer whichever ATA the client actually passed in remaining_accounts
                let ai_opt = rem.get(&ata_v1).copied().or_else(|| rem.get(&ata_v22).copied());

                let amount: u64 = match ai_opt {
                    Some(ai) if *ai.owner == token::ID => {
                        let data_ref = ai.data.borrow();
                        match token::spl_token::state::Account::unpack_from_slice(&data_ref) {
                            Ok(ta) if ta.owner == wm.wallet && ta.mint == *mint => ta.amount,
                            _ => 0,
                        }
                    }
                    Some(ai) if *ai.owner == token_2022::ID => {
                        let data_ref = ai.data.borrow();
                        match token_2022::spl_token_2022::state::Account::unpack_from_slice(&data_ref) {
                            Ok(ta) if ta.owner == wm.wallet && ta.mint == *mint => ta.amount,
                            _ => 0,
                        }
                    }
                    _ => 0,
                };

                out.push(Balance {
                    wallet: wm.wallet,
                    mint: *mint,
                    amount,
                });
            }
        }

        // Return all results
        let bytes = out.try_to_vec()?;
        set_return_data(&bytes);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct GetBalances {}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct WalletMints {
    pub wallet: Pubkey,
    pub mints: Vec<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct Balance {
    pub wallet: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
}
````

## Block 2

SHA-256: `5fa5dca36bf69676309ccce83430afbdb198d9852b81f9f81c34de63f9e578e8`

````text
anchor build
````

## Block 3

SHA-256: `22052f89b49887fab7e22821c395981ae52485c6af11f6691d55c003cad854e8`

````text
anchor deploy
````

## Block 4

SHA-256: `caa188e35e8354560f477c05bf250d8974db789f7c24e9a44e53d936f2d4912c`

````text
import * as anchor from “@coral-xyz/anchor”;
import {
  AddressLookupTableProgram,
  PublicKey,
} from “@solana/web3.js”;
import fs from “fs”;

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const payer = provider.wallet;

  const slot = await connection.getSlot(”confirmed”);

  const [createIx, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: payer.publicKey,
      payer: payer.publicKey,
      recentSlot: slot,
    });

  const tx = new anchor.web3.Transaction().add(createIx);
  const sig = await provider.sendAndConfirm(tx, []);

  console.log(”ALT created”);
  console.log(”sig:”, sig);
  console.log(”lookupTableAddress:”, lookupTableAddress.toBase58());

  fs.writeFileSync(
    “alt.json”,
    JSON.stringify({ lookupTableAddress: lookupTableAddress.toBase58() }, null, 2),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
````

## Block 5

SHA-256: `482ffac8db2e823522677f0150639d6ef19ab03a355022344d775d78c27e7cd9`

````text
import { PublicKey, TransactionSignature, AddressLookupTableProgram } from “@solana/web3.js”;
import * as anchor from “@coral-xyz/anchor”;
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from “@solana/spl-token”;
import {WalletTokenBalances}from“../target/types/wallet_token_balances”;
import {TransactionMessage, VersionedTransaction} from “@solana/web3.js”;

/**
 * Types mirroring your Rust structs
 */
export type WalletMints = {
  wallet: PublicKey;
  mints: PublicKey[];
};

export type BalanceResult = {
  wallet: PublicKey;
  mint: PublicKey;
  amount: bigint;
};

async function ensureAltHasAddresses(
  provider: anchor.AnchorProvider,
  altPubkey: PublicKey,
  addrs: PublicKey[],
) {
  const connection = provider.connection;

  const altResp = await connection.getAddressLookupTable(altPubkey);
  const altAccount = altResp.value;
  if (!altAccount) {
    throw new Error(”ALT not found (maybe not finalized yet?)”);
  }

  const existing = new Set(altAccount.state.addresses.map((a) => a.toBase58()));
  const missing = addrs.filter((a) => !existing.has(a.toBase58()));

  if (missing.length === 0) {
    return altAccount; // nothing to do
  }

  const extendIx = AddressLookupTableProgram.extendLookupTable({
    payer: provider.wallet.publicKey,
    authority: provider.wallet.publicKey,
    lookupTable: altPubkey,
    addresses: missing,
  });

  const tx = new anchor.web3.Transaction().add(extendIx);
  const sig = await provider.sendAndConfirm(tx, []);
  console.log(`ALT extended with ${missing.length} addresses. sig:`, sig);

  // refetch updated ALT
  const altResp2 = await connection.getAddressLookupTable(altPubkey);
  if (!altResp2.value) throw new Error(”ALT refetch failed after extend”);
  return altResp2.value;
}

export async function getBalancesClient(
  program: anchor.Program<WalletTokenBalances>,
  walletMints: { wallet: PublicKey; mints: PublicKey[] }[],
  altPubkey: PublicKey, // pass ALT separately
): Promise<{ sig: TransactionSignature; balances: BalanceResult[] }> {
  const provider = program.provider as anchor.AnchorProvider;
  const connection = provider.connection;

  // 1) Compute candidate ATAs (v1 + 2022)
  const candidateAtas: PublicKey[] = [];
  for (const wm of walletMints) {
    for (const mint of wm.mints) {
      candidateAtas.push(getAssociatedTokenAddressSync(mint, wm.wallet, true));
      candidateAtas.push(
        getAssociatedTokenAddressSync(mint, wm.wallet, true, TOKEN_2022_PROGRAM_ID),
      );
    }
  }

  // 2) Filter only existing ATAs -> these will be remaining accounts AND ALT entries
  const infos = await connection.getMultipleAccountsInfo(candidateAtas);
  const existingAtas: PublicKey[] = [];
  for (let i = 0; i < candidateAtas.length; i++) {
    if (infos[i]) existingAtas.push(candidateAtas[i]);
  }

  const remainingAccounts: anchor.web3.AccountMeta[] = existingAtas.map((pk) => ({
    pubkey: pk,
    isWritable: false,
    isSigner: false,
  }));

  // 3) Ensure ALT contains these ATA addresses (one-time-ish)
  const altAccount = await ensureAltHasAddresses(provider, altPubkey, existingAtas);

  // 4) Build the instruction
  const ix = await program.methods
    .getBalances(
      walletMints.map((wm) => ({ wallet: wm.wallet, mints: wm.mints })),
    )
    .accounts({})
    .remainingAccounts(remainingAccounts)
    .instruction();

  // 5) Build and send v0 transaction USING ALT
  const latest = await connection.getLatestBlockhash(”confirmed”);

  const msgV0 = new TransactionMessage({
    payerKey: provider.wallet.publicKey,
    recentBlockhash: latest.blockhash,
    instructions: [ix],
  }).compileToV0Message([altAccount]);

  const vtx = new VersionedTransaction(msgV0);
  await provider.wallet.signTransaction(vtx);

  const sig = await connection.sendTransaction(vtx, { maxRetries: 3 });
  await connection.confirmTransaction({ signature: sig, ...latest }, “confirmed”);

  // 6) Fetch tx + return data (same as you already do)
  const txInfo = await connection.getTransaction(sig, {
    commitment: “confirmed”,
    maxSupportedTransactionVersion: 0,
  });
  if (!txInfo) throw new Error(”getTransaction returned null”);

  const metaAny = txInfo.meta as any;
  const rd = metaAny?.returnData as { programId: string; data: [string, string] } | null | undefined;
  if (!rd) throw new Error(”Transaction succeeded but meta.returnData is null”);

  const raw = Buffer.from(rd.data[0], “base64”);
  const balances = decodeBalances(raw);
  return { sig, balances };
}


/**
 * Decode Vec<Balance> from Borsh:
 * struct Balance { wallet: Pubkey; mint: Pubkey; amount: u64 }
 *
 * Layout:
 * - u32 length (little endian)
 * - then `len` * (32 + 32 + 8) bytes
 */
function decodeBalances(buf: Buffer): BalanceResult[] {
  let offset = 0;
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  const len = dv.getUint32(offset, true);
  offset += 4;

  const results: BalanceResult[] = [];
  for (let i = 0; i < len; i++) {
    const walletBytes = buf.slice(offset, offset + 32);
    offset += 32;
    const mintBytes = buf.slice(offset, offset + 32);
    offset += 32;
    const amount = dv.getBigUint64(offset, true);
    offset += 8;

    results.push({
      wallet: new PublicKey(walletBytes),
      mint: new PublicKey(mintBytes),
      amount,
    });
  }

  return results;
}

async function main() {
  // 1) Setup provider from env / solana config
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Use Anchor workspace (uses generated IDL/types under target/)
  const program = anchor.workspace
  .walletTokenBalances as anchor.Program<WalletTokenBalances>;
  const wallet = provider.wallet as anchor.Wallet;

  // 4) Paste real mint pubkeys from spl-token CLI
  const MINT_V1 = new PublicKey(”86uVjmYf4ehGPRZYhMWzHM4yMmEj13TNtutSnvESPLLN”);
  const MINT_22 = new PublicKey(”2hyxpEgEH7gAFTPQi6Yguqxg4gmn9KSDyaGUfL7dJm7p”);
  const altPubkey = new PublicKey(”5h6TFGPPaF2r9unFdS2ExqGveVNhFRWGQtURQ1RZvxSd”);

  const walletMints = [{
    wallet: wallet.publicKey,
    mints: [MINT_V1, MINT_22],
  }];

  // 5) Call your on-chain program
  const { sig, balances } = await getBalancesClient(program, walletMints, altPubkey);

  console.log(”tx:”, sig);
  for (const b of balances) {
    console.log(
      “wallet”,
      b.wallet.toBase58(),
      “mint”,
      b.mint.toBase58(),
      “amount”,
      b.amount.toString(),
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
````

## Block 6

SHA-256: `ddd6ea50d03f20c8b836268718bb7090719cc4330dc59aead0722eb9ee5b5e31`

````text
 npx ts-node scripts/client.ts
````

## Block 7

SHA-256: `756bd0530957d7b3675098ad84be32e9245a8b86720ce8730858cca5ea481738`

````text
[{ wallet, mints: [MINT_V1, MINT_22] }]
````

## Block 8

SHA-256: `12d83dcf3e89bd817e5fc1ece7b46ab37f1f8bee0bf5706755422847c73a1ad5`

````text
getAssociatedTokenAddressSync(mint, wallet) // v1
getAssociatedTokenAddressSync(mint, wallet, ..., TOKEN_2022_PROGRAM_ID) // 2022
````

## Block 9

SHA-256: `a9466a1dabb48bd9dfd9a32464ffe51b2d10672a4912b3099ab9fe223ba9dff8`

````text
const infos = await connection.getMultipleAccountsInfo(candidateAtas);
````

## Block 10

SHA-256: `e33df55599c384b984a0eddf030e8cb7076134e29510855146b319d25d1d56ff`

````text
.accounts({})
.remainingAccounts(remainingAccounts)
````

## Block 11

SHA-256: `71ba292b25a8df5a40245a13ddcc81d09d6701d326806499e92fdcf22fe784cc`

````text
ensureAltHasAddresses(...)
````

## Block 12

SHA-256: `19776e368792862cea69fb8e6d638dbda177923dc33b302741f742b320da020d`

````text
new TransactionMessage({...}).compileToV0Message([altAccount]);
````

## Block 13

SHA-256: `d1bf33092590a282318415364c4746693a40b91f8cd742faf630bc7661e31723`

````text
const vtx = new VersionedTransaction(msgV0);
await provider.wallet.signTransaction(vtx);
await connection.sendTransaction(vtx);
````
