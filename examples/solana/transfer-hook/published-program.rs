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
