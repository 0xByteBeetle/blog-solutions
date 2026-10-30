use anchor_lang::prelude::*;
use spl_transfer_hook_interface::instruction::TransferHookInstruction;

declare_id!("AgfLd9BmQcLZj9h13gYTsAgWdEnXKAArnRypuPd9hCub");

#[program]
pub mod transfer_hook_project {
    use super::*;

    pub fn initialize_extra_account_meta_list(ctx: Context<InitializeExtraAccountMetaList>) -> Result<()> {
        let account_metas = vec![
            spl_tlv_account_resolution::account::ExtraAccountMeta::new_with_seeds(
                &[
                    spl_tlv_account_resolution::seeds::Seed::Literal { bytes: b"extra-account-metas".to_vec() },
                    spl_tlv_account_resolution::seeds::Seed::AccountKey { index: 1 },
                ],
                false,
                false,
            )?
        ];

        let mut data = ctx.accounts.extra_metas_account.try_borrow_mut_data()?;
        
        spl_tlv_account_resolution::state::ExtraAccountMetaList::init::<
            spl_transfer_hook_interface::instruction::ExecuteInstruction
        >(&mut data, &account_metas)?;

        msg!("Extra Account Meta List Initialized");
        Ok(())
    }

    // Renamed to match the official guide
    pub fn transfer_hook(_ctx: Context<TransferHook>, amount: u64) -> Result<()> {
        msg!("Hook triggered for amount: {}", amount);
        if amount > 1_000_000_000_000 { 
            return err!(ErrorCode::AmountTooBig);
        }
        Ok(())
    }

    // The Fallback correctly routes internally using Anchor's generated dispatcher
    pub fn fallback<'info>(program_id: &Pubkey, accounts: &'info [AccountInfo<'info>], data: &[u8]) -> Result<()> {
        let instruction = TransferHookInstruction::unpack(data)?;
        match instruction {
            TransferHookInstruction::Execute { amount } => {
                let amount_bytes = amount.to_le_bytes();
                
                // This is the magic line from the docs. No `invoke`, no CPI!
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
    /// CHECK: PDA for extra metas
    pub extra_metas_account: AccountInfo<'info>,
    /// CHECK: Mint
    pub mint: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferHook<'info> {
    /// CHECK: Source
    pub source: AccountInfo<'info>,
    /// CHECK: Mint
    pub mint: AccountInfo<'info>,
    /// CHECK: Destination
    pub destination: AccountInfo<'info>,
    /// CHECK: Owner
    pub owner: AccountInfo<'info>, 
    /// CHECK: PDA (We get to keep seeds and bump because of the __private router!)
    #[account(
        seeds = [b"extra-account-metas", mint.key().as_ref()], 
        bump
    )]
    pub extra_metas_account: UncheckedAccount<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Transfer amount exceeds the blog's demo limit")]
    AmountTooBig,
}