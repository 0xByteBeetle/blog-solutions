// Authorized ALT-readiness variant. Original implementation is preserved in client.ts.
// Changes: readiness polling, consistent confirmed RPC context, and import-safe entrypoint.
import { PublicKey, TransactionSignature, AddressLookupTableProgram, Connection } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { WalletTokenBalances } from "../target/types/wallet_token_balances";
import {
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

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

export async function waitForAltReadiness(
  connection: Pick<Connection, "getAddressLookupTable">,
  altPubkey: PublicKey,
  requiredAddresses: PublicKey[],
  timeoutMs = 30000,
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const response = await connection.getAddressLookupTable(altPubkey, {
      commitment: "confirmed",
    });
    const table = response.value;
    if (table) {
      const addresses = new Set(table.state.addresses.map(a => a.toBase58()));
      // Account contents may already include entries that are not usable in this slot.
      if (response.context.slot > table.state.lastExtendedSlot &&
          requiredAddresses.every(a => addresses.has(a.toBase58()))) {
        return table;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`ALT ${altPubkey.toBase58()} did not become ready within ${timeoutMs}ms`);
}

async function ensureAltHasAddresses(
  provider: anchor.AnchorProvider,
  altPubkey: PublicKey,
  addrs: PublicKey[],
) {
  const connection = provider.connection;

  const altResp = await connection.getAddressLookupTable(altPubkey, { commitment: "confirmed" });
  const altAccount = altResp.value;
  if (!altAccount) {
    throw new Error("ALT not found (maybe not finalized yet?)");
  }

  const existing = new Set(altAccount.state.addresses.map((a) => a.toBase58()));
  const missing = addrs.filter((a) => !existing.has(a.toBase58()));

  if (missing.length === 0) {
    return waitForAltReadiness(connection, altPubkey, addrs);
  }

  const extendIx = AddressLookupTableProgram.extendLookupTable({
    payer: provider.wallet.publicKey,
    authority: provider.wallet.publicKey,
    lookupTable: altPubkey,
    addresses: missing,
  });

  const tx = new anchor.web3.Transaction().add(extendIx);
  const sig = await provider.sendAndConfirm(tx, [], {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
  console.log(`ALT extended with ${missing.length} addresses. sig:`, sig);

  return waitForAltReadiness(connection, altPubkey, addrs);
}

// ...

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

  // 4) Build the instruction (same as before)
  const ix = await program.methods
    .getBalances(
      walletMints.map((wm) => ({ wallet: wm.wallet, mints: wm.mints })),
    )
    .accounts({})
    .remainingAccounts(remainingAccounts)
    .instruction();

  // 5) Build and send v0 transaction USING ALT
  const minContextSlot = altAccount.state.lastExtendedSlot + 1;
  const latest = await connection.getLatestBlockhash({ commitment: "confirmed", minContextSlot });

  const msgV0 = new TransactionMessage({
    payerKey: provider.wallet.publicKey,
    recentBlockhash: latest.blockhash,
    instructions: [ix],
  }).compileToV0Message([altAccount]);

  const vtx = new VersionedTransaction(msgV0);
  await provider.wallet.signTransaction(vtx);

  const sig = await connection.sendTransaction(vtx, {
    maxRetries: 3,
    preflightCommitment: "confirmed",
    minContextSlot,
  });
  await connection.confirmTransaction({ signature: sig, ...latest }, "confirmed");

  // 6) Fetch tx + return data (same as you already do)
  const txInfo = await connection.getTransaction(sig, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  if (!txInfo) throw new Error("getTransaction returned null");

  const metaAny = txInfo.meta as any;
  const rd = metaAny?.returnData as { programId: string; data: [string, string] } | null | undefined;
  if (!rd) throw new Error("Transaction succeeded but meta.returnData is null");

  const raw = Buffer.from(rd.data[0], "base64");
  const balances = decodeBalances(raw);
  return { sig, balances };
}

// export async function getBalancesClient(
//   program: anchor.Program<WalletTokenBalances>,
//   walletMints: WalletMints[],
// ): Promise<{ sig: TransactionSignature; balances: BalanceResult[] }> {
//   const provider = program.provider as anchor.AnchorProvider;
//   const connection = provider.connection;

//   // 1) Build list of candidate ATAs (Token v1 + Token-2022)
//   const candidateAtas: PublicKey[] = [];
//   for (const wm of walletMints) {

//     const extendIx = AddressLookupTableProgram.extendLookupTable({
//       payer: provider.wallet.publicKey,
//       authority: provider.wallet.publicKey,
//       lookupTable: wm.alt_table_addr,
//       addresses: wm.alt_addrs, // your 2 addresses
//     });

//     const extendTx = new anchor.web3.Transaction().add(extendIx);
//     const extendSig = await provider.sendAndConfirm(extendTx, []);
//     console.log("ALT extended:", extendSig);

//     for (const mint of wm.mints) {
//       // SPL-Token v1 ATA
//       const ataV1 = getAssociatedTokenAddressSync(
//         mint,
//         wm.wallet,
//         true, // allow owner off-curve if needed
//       );
//       candidateAtas.push(ataV1);

//       // Token-2022 ATA
//       const ataV22 = getAssociatedTokenAddressSync(
//         mint,
//         wm.wallet,
//         true,
//         TOKEN_2022_PROGRAM_ID,
//       );
//       candidateAtas.push(ataV22);
//     }
//   }

//   // 2) Filter only existing accounts (avoid AccountNotFound)
//   const infos = await connection.getMultipleAccountsInfo(candidateAtas);
//   const remainingAccounts: anchor.web3.AccountMeta[] = [];
//   for (let i = 0; i < candidateAtas.length; i++) {
//     if (infos[i]) {
//       remainingAccounts.push({
//         pubkey: candidateAtas[i],
//         isWritable: false,
//         isSigner: false,
//       });
//     }
//   }

//   // 3) Call the instruction
//   const tx = await program.methods
//     .getBalances(
//       walletMints.map((wm) => ({
//         wallet: wm.wallet,
//         mints: wm.mints,
//       })),
//     )
//     .accounts({}) // GetBalances {} is empty in Rust
//     .remainingAccounts(remainingAccounts)
//     .transaction();

//   const sig = await provider.sendAndConfirm(tx, []);

//   // 4) Fetch transaction and read return data
//   const txInfo = await connection.getTransaction(sig, {
//     commitment: "confirmed",
//     maxSupportedTransactionVersion: 0,
//   });

//   if (!txInfo) {
//     throw new Error("getTransaction returned null (tx not yet at 'confirmed' or RPC pruned it)");
//   }

//   const metaAny = txInfo.meta as any;

//   console.log("err:", metaAny?.err);
//   console.log("logs:", metaAny?.logMessages);
//   console.log("returnData:", metaAny?.returnData);

//   const rd = metaAny?.returnData as
//     | { programId: string; data: [string, string] }
//     | null
//     | undefined;

//   if (!rd) {
//     throw new Error("Transaction succeeded but meta.returnData is null");
//   }

//   const dataBase64 = rd.data[0];
//   const raw = Buffer.from(dataBase64, "base64");

//   const balances = decodeBalances(raw);
//   return { sig, balances };
// }

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
  const MINT_V1 = new PublicKey("86uVjmYf4ehGPRZYhMWzHM4yMmEj13TNtutSnvESPLLN");
  const MINT_22 = new PublicKey("2hyxpEgEH7gAFTPQi6Yguqxg4gmn9KSDyaGUfL7dJm7p");
  const altPubkey = new PublicKey("5h6TFGPPaF2r9unFdS2ExqGveVNhFRWGQtURQ1RZvxSd");

  const walletMints = [{
    wallet: wallet.publicKey,
    mints: [MINT_V1, MINT_22],
  }];

  // 5) Call your on-chain program
  const { sig, balances } = await getBalancesClient(program, walletMints, altPubkey);

  console.log("tx:", sig);
  for (const b of balances) {
    console.log(
      "wallet",
      b.wallet.toBase58(),
      "mint",
      b.mint.toBase58(),
      "amount",
      b.amount.toString(),
    );
  }
}

if (require.main === module) main().catch((err) => {
  console.error(err);
  process.exit(1);
});
