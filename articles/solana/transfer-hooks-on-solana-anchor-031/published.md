# Published examples

Source: https://andreyobruchkov1996.substack.com/p/transfer-hooks-on-solana-anchor-031

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `321cab4f946dc5c8610449eadd65ad0f62b6e0133fe257603f3be98db1fe5d9f`

````text
...
[dependencies]
anchor-lang = "0.31.1"
anchor-spl = { version = "0.31.1", features = ["token_2022", "token_2022_extensions"] }

spl-transfer-hook-interface = "0.10.0"
spl-tlv-account-resolution = "0.10.0"
````

## Block 2

SHA-256: `bd5ea71a70e995d0fcc50a9ce86d26ffe5dc8174793960993d1010f5c22cddb5`

````text
#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(
        init,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump,
        payer = payer,
        // 8 bytes for the Anchor discriminator + 64 bytes for the TLV data
        space = 8 + 64 
    )]
    /// CHECK: PDA storing the metadata roadmap for the Token-2022 program
    pub extra_metas_account: AccountInfo<'info>,
    /// CHECK: The SPL Token Mint
    pub mint: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
````

## Block 3

SHA-256: `4b89f20bb02715a6eaff574c710ec49933d7560942fa5a72e79850747d49ef11`

````text
// Under the hood, Anchor translates that macro into the raw Solana runtime function: 
Pubkey::find_program_address(&[b"extra-account-metas", mint.key().as_ref()], program_id)
````

## Block 4

SHA-256: `451fab2c3a9d72ac07ddcd50a2201ff2cf2282ae7df01a7f784b0268184013a6`

````text
    pub fn initialize_extra_account_meta_list(ctx: Context<InitializeExtraAccountMetaList>) -> Result<()> {
        let account_metas = vec![
            // Instructs Token-2022 to derive the required PDA using dynamic seeds
            spl_tlv_account_resolution::account::ExtraAccountMeta::new_with_seeds(
                &[
                    spl_tlv_account_resolution::seeds::Seed::Literal { bytes: b"extra-account-metas".to_vec() },
                    spl_tlv_account_resolution::seeds::Seed::AccountKey { index: 1 }, // Resolves using the Mint (Index 1)
                ],
                false, // is_signer
                false, // is_writable
            )?
        ];

        let mut data = ctx.accounts.extra_metas_account.try_borrow_mut_data()?;
        
        // Formats the data as a Type-Length-Value (TLV) structure for the Execute instruction
        spl_tlv_account_resolution::state::ExtraAccountMetaList::init::<
            spl_transfer_hook_interface::instruction::ExecuteInstruction
        >(&mut data, &account_metas)?;

        msg!("Extra Account Meta List Initialized");
        Ok(())
    }
````

## Block 5

SHA-256: `77cd763ccfa469265e77a3e8d92a8bd3b12bed9dc20b27e1381b2860eafcf0c2`

````text
let mut data = ctx.accounts.extra_metas_account.try_borrow_mut_data()?;
````

## Block 6

SHA-256: `8427441afcbb80f68a0b4ae66fd02fd941bae1179ccf9f9917a77e018d94df50`

````text
spl_tlv_account_resolution::state::ExtraAccountMetaList::init::<
    spl_transfer_hook_interface::instruction::ExecuteInstruction
>(&mut data, &account_metas)?;
````

## Block 7

SHA-256: `0899e1fcd810a950f3f84c5f600e0cf781dc96092e8d188cb0357a443b8c7a67`

````text
use anchor_lang::prelude::*;
use spl_transfer_hook_interface::instruction::TransferHookInstruction;

declare_id!("<YourGeneratedAddress>");

#[program]
pub mod transfer_hook_project {
    use super::*;

    /// Initializes the PDA that Token-2022 reads to resolve extra accounts.
    pub fn initialize_extra_account_meta_list(ctx: Context<InitializeExtraAccountMetaList>) -> Result<()> {
        let account_metas = vec![
            // Instructs Token-2022 to derive the required PDA using dynamic seeds
            spl_tlv_account_resolution::account::ExtraAccountMeta::new_with_seeds(
                &[
                    spl_tlv_account_resolution::seeds::Seed::Literal { bytes: b"extra-account-metas".to_vec() },
                    spl_tlv_account_resolution::seeds::Seed::AccountKey { index: 1 }, // Resolves using the Mint (Index 1)
                ],
                false, // is_signer
                false, // is_writable
            )?
        ];

        let mut data = ctx.accounts.extra_metas_account.try_borrow_mut_data()?;
        
        spl_tlv_account_resolution::state::ExtraAccountMetaList::init::<
            spl_transfer_hook_interface::instruction::ExecuteInstruction
        >(&mut data, &account_metas)?;

        msg!("Extra Account Meta List Initialized");
        Ok(())
    }

    pub fn transfer_hook(_ctx: Context<TransferHook>, amount: u64) -> Result<()> {
        msg!("Hook executed for transfer amount: {}", amount);
        
        if amount > 1_000_000_000_000 { 
            return err!(ErrorCode::TransferVolumeExceeded);
        }
        Ok(())
    }

    pub fn fallback<'info>(program_id: &Pubkey, accounts: &'info [AccountInfo<'info>], data: &[u8]) -> Result<()> {
        let instruction = TransferHookInstruction::unpack(data)?;
        match instruction {
            TransferHookInstruction::Execute { amount } => {
                let amount_bytes = amount.to_le_bytes();
                
                // Routes execution to the Anchor instruction without requiring a standard CPI
                __private::__global::transfer_hook(program_id, accounts, &amount_bytes)
            }
            _ => return Err(ProgramError::InvalidInstructionData.into()),
        }
    }
}

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(
        init,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump,
        payer = payer,
        space = 8 + 64 
    )]
    pub extra_metas_account: AccountInfo<'info>,
    pub mint: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferHook<'info> {
    /// CHECK: Source Token Account
    pub source: AccountInfo<'info>,
    /// CHECK: The SPL Token Mint
    pub mint: AccountInfo<'info>,
    /// CHECK: Destination Token Account
    pub destination: AccountInfo<'info>,
    /// CHECK: Owner of the Source Account
    pub owner: AccountInfo<'info>, 
    /// CHECK: The resolved ExtraAccountMetaList PDA
    #[account(
        seeds = [b"extra-account-metas", mint.key().as_ref()], 
        bump
    )]
    pub extra_metas_account: UncheckedAccount<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Transfer amount exceeds the maximum protocol limit.")]
    TransferVolumeExceeded,
}
````

## Block 8

SHA-256: `b4f5d0a3715c411d32e248502bcf4c80df306f02af3de9e08e94d8e2a7fbe5b7`

````text
[provider]
cluster = "Devnet"
wallet = "~/.config/solana/id.json" # Ensure this points to your active deployment keypair

[programs.devnet]
transfer_hook_project = "<YOUR_NEW_PROGRAM_ID>"
````

## Block 9

SHA-256: `0b460ce3c9d9213d2841fb92e7890a6222e1e4650ce64178cd21bf8a26b4e9d4`

````text
anchor clean
anchor build
anchor deploy
````

## Block 10

SHA-256: `ac7e79d1aca741d0930cc0c64748e69bbe22d89680978d04d993e03516f4110f`

````text
# Create the Token-2022 Mint and attach the newly deployed Hook
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --transfer-hook <YOUR_PROGRAM_ID> --url devnet

# output:
# Creating token 71H52RsWiLbMXQuBtH5a1hLSzUnbTgiDjFhktuJrJT1m under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

# Address:  71H52RsWiLbMXQuBtH5a1hLSzUnbTgiDjFhktuJrJT1m
# Decimals:  9

# Signature: 2rtXMX3TaXZoWMJqcYj7vwhtWng3eLUBfDHbG4N45QxnQnuwrNReKZgPoLPNfHKBXofuoH1daFAP73FoWJAFRWJV
````

## Block 11

SHA-256: `9d6233b8cf912a632a5f5d485c077551e5057dd6c3eaa48bf5f9c24f8b0bed7d`

````text
# Create your Devnet Associated Token Account (ATA)
spl-token create-account <TOKEN_MINT_ADDRESS> --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --url devnet

# Mint the initial test supply to your wallet
spl-token mint <TOKEN_MINT_ADDRESS> 2000 --url devnet
````

## Block 12

SHA-256: `6145540021f492a66d6788749af39daa9f2112910aa831d1681f449978f7cb1b`

````text
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TransferHookProject } from "../target/types/transfer_hook_project";

async function main() {
    // 1. Force the provider to use Devnet
    process.env.ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    // 2. Define your specific Devnet addresses
    const programId = new anchor.web3.PublicKey("<ProgramID>");
    const mintAddress = new anchor.web3.PublicKey("<MintID>");

    console.log("Connecting to Devnet as:", provider.wallet.publicKey.toBase58());

    // 3. Load the workspace program
    const program = anchor.workspace.TransferHookProject as Program<TransferHookProject>;

    // 4. Deterministically derive the PDA using the exact Token-2022 seeds
    // Only for the print, not needed for the program its done automatically.
    const [extraMetasPDA] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("extra-account-metas"), mintAddress.toBuffer()],
        programId
    );

    console.log("Target Mint:", mintAddress.toBase58());
    console.log("Derived Metadata PDA:", extraMetasPDA.toBase58());
    console.log("Broadcasting initialization transaction...");

    // 5. Execute the Anchor instruction
    try {
        const tx = await program.methods
            .initializeExtraAccountMetaList()
            .accounts({
                mint: mintAddress,
            })
            .rpc();

        console.log("\nSuccess! The ExtraAccountMetaList roadmap is live on Devnet.");
        console.log(`View on Explorer: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    } catch (error) {
        console.error("Transaction failed:", error);
    }
}

main();
````

## Block 13

SHA-256: `d5186dc2402c29a36dc2db60c9b8b48a9eb37108270802b8ac79287a3eb3abba`

````text
spl-token transfer <TOKEN_MINT_ADDRESS> 1500 <DESTINATION_WALLET> --fund-recipient --url devnet
````

## Block 14

SHA-256: `fa2be029032b7b78f693a3c48abe24a2528d48b185974e1678bdb397d930a25e`

````text
Error: Client(Error { request: Some(SendTransaction), kind: RpcError(RpcResponseError { code: -32002, message: "Transaction simulation failed: Error processing Instruction 1: custom program error: 0x1770", data: SendTransactionPreflightFailure(RpcSimulateTransactionResult { err: Some(UiTransactionError(InstructionError(1, Custom(6000)))), logs: Some([
  ...
  "Program log: Instruction: TransferHook", 
  "Program log: Hook triggered for amount: 1500000000000", 
  "Program log: AnchorError thrown in programs/transfer-hook-project/src/lib.rs:36. Error Code: AmountTooBig. Error Number: 6000. Error Message: Transfer amount exceeds the blog's demo limit.", 
  "Program AgfLd9BmQcLZj9h13gYTsAgWdEnXKAArnRypuPd9hCub failed: custom program error: 0x1770"
])
````

## Block 15

SHA-256: `4db02a32a8422ae11861c15dfb781ac57baf5e2cb9dd55a0efd4bbbb1ca4d7aa`

````text
spl-token transfer <TOKEN_MINT_ADDRESS> 500 <DESTINATION_WALLET> --fund-recipient --url devnet
````
