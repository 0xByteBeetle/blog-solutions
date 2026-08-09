use anchor_lang::prelude::*;

declare_id!("xwFycoUEijNTc5j668Hhj41RCX8fGWJRjzWUeNNbZDP");

#[program]
pub mod accounts_lab {
    use super::*;

    pub fn create_user(ctx: Context<CreateUser>, name: String) -> Result<()> {
        require!(name.len() <= UserAccount::MAX_NAME_BYTES, BlogError::NameTooLong);

        let user = &mut ctx.accounts.user_account;
        user.owner = ctx.accounts.authority.key();
        user.name = name;
        user.created_at = Clock::get()?.unix_timestamp;
        user.bump = ctx.bumps.user_account;
        Ok(())
    }

    pub fn update_name(ctx: Context<UpdateUser>, new_name: String) -> Result<()> {
        require!(
            new_name.len() <= UserAccount::MAX_NAME_BYTES,
            BlogError::NameTooLong
        );
        ctx.accounts.user_account.name = new_name;
        Ok(())
    }

    pub fn close_user(_ctx: Context<CloseUser>) -> Result<()> {
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub owner: Pubkey,
    #[max_len(32)]
    pub name: String,
    pub created_at: i64,
    pub bump: u8,
}

impl UserAccount {
    pub const MAX_NAME_BYTES: usize = 32;
    pub const SPACE: usize = 8 + Self::INIT_SPACE;
}

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = UserAccount::SPACE,
        seeds = [b"user", authority.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateUser<'info> {
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"user", authority.key().as_ref()],
        bump = user_account.bump,
        constraint = user_account.owner == authority.key() @ BlogError::WrongAuthority
    )]
    pub user_account: Account<'info, UserAccount>,
}

#[derive(Accounts)]
pub struct CloseUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        close = authority,
        seeds = [b"user", authority.key().as_ref()],
        bump = user_account.bump,
        constraint = user_account.owner == authority.key() @ BlogError::WrongAuthority
    )]
    pub user_account: Account<'info, UserAccount>,
}

#[error_code]
pub enum BlogError {
    #[msg("The name is longer than 32 UTF-8 bytes")]
    NameTooLong,
    #[msg("Only the account owner can change this profile")]
    WrongAuthority,
}
