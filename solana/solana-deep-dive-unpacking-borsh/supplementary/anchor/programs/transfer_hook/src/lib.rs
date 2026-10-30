use anchor_lang::prelude::*;
use anchor_spl::{
    token_2022::spl_token_2022::{
        extension::{
            transfer_hook::TransferHookAccount,
            BaseStateWithExtensions,
            StateWithExtensions,
        },
        state::Account as SplTokenAccount,
    },
    token_interface::{Mint, TokenAccount},
};
use spl_tlv_account_resolution::state::ExtraAccountMetaList;
use spl_transfer_hook_interface::instruction::{ExecuteInstruction, TransferHookInstruction};

declare_id!("3YAaWETbu4RMYx93XzW12ogaruJGy5TYqPhGutoYbjxp");

pub const MAX_TRANSFER_AMOUNT: u64 = 1_000;

#[program]
pub mod transfer_hook {
    use super::*;

    pub fn initialize_extra_account_meta_list(
        ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {
        let mut data = ctx
            .accounts
            .extra_account_meta_list
            .try_borrow_mut_data()?;
        ExtraAccountMetaList::init::<ExecuteInstruction>(&mut data, &[])?;
        Ok(())
    }

    pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
        assert_is_transferring(&ctx.accounts.source_token)?;
        require!(amount <= MAX_TRANSFER_AMOUNT, BlogError::AmountTooLarge);
        msg!("Transfer hook accepted {amount} base units");
        Ok(())
    }

    pub fn fallback<'info>(
        program_id: &Pubkey,
        accounts: &'info [AccountInfo<'info>],
        data: &[u8],
    ) -> Result<()> {
        match TransferHookInstruction::unpack(data)? {
            TransferHookInstruction::Execute { amount } => {
                __private::__global::transfer_hook(program_id, accounts, &amount.to_le_bytes())
            }
            _ => Err(ProgramError::InvalidInstructionData.into()),
        }
    }
}

fn assert_is_transferring(source: &InterfaceAccount<TokenAccount>) -> Result<()> {
    let source_info = source.to_account_info();
    let source_data = source_info.try_borrow_data()?;
    let account = StateWithExtensions::<SplTokenAccount>::unpack(&source_data)?;
    let extension = account.get_extension::<TransferHookAccount>()?;
    require!(
        bool::from(extension.transferring),
        BlogError::NotInTokenTransfer
    );
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(
        init,
        payer = payer,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump,
        space = ExtraAccountMetaList::size_of(0)?
    )]
    /// CHECK: The transfer-hook interface defines this PDA and its TLV layout.
    pub extra_account_meta_list: AccountInfo<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferHook<'info> {
    pub source_token: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    pub destination_token: InterfaceAccount<'info, TokenAccount>,
    /// CHECK: Token-2022 supplies the transfer authority as the fourth account.
    pub owner: UncheckedAccount<'info>,
    #[account(
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump
    )]
    /// CHECK: The PDA and its position are fixed by the transfer-hook interface.
    pub extra_account_meta_list: UncheckedAccount<'info>,
}

#[error_code]
pub enum BlogError {
    #[msg("The transfer exceeds the blog lab's 1,000 base-unit limit")]
    AmountTooLarge,
    #[msg("The hook can only be called by Token-2022 during a transfer")]
    NotInTokenTransfer,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn article_threshold_is_explicit_in_base_units() {
        assert_eq!(MAX_TRANSFER_AMOUNT, 1_000);
    }
}
