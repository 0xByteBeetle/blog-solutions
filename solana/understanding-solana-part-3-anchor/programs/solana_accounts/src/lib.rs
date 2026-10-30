use anchor_lang::prelude::*;

declare_id!("Ga1UVR2AoZAazWCSZQUg7ZdKkpNXxLCXju4eN5YRrKQJ");

#[program]
pub mod solana_accounts {
    use super::*;

    /// Create a PDA for the user and store their name + creation time.
    pub fn create_user(ctx: Context<CreateUser>, name: String) -> Result<()> {
        // Enforce max length in BYTES (UTF-8). Emojis count as multiple bytes.
        require!(
            name.as_bytes().len() <= UserAccount::MAX_NAME,
            ErrorCode::NameTooLong
        );

        let user = &mut ctx.accounts.user_account;
        user.owner = ctx.accounts.authority.key();
        user.name = name.clone(); // fits because we sized with MAX_NAME
        user.created_at = Clock::get()?.unix_timestamp;
        user.bump = ctx.bumps.user_account;

        msg!("✅ Created user PDA: {}", user.key());
        msg!("   Owner: {}", user.owner);
        msg!("   Name: {}", name);
        msg!("   Created at: {}", user.created_at);
        Ok(())
    }

    /// Update name field (only the owner can do it).
    /// No realloc needed as long as new_name.len() ≤ MAX_NAME.
    pub fn update_name(ctx: Context<UpdateUser>, new_name: String) -> Result<()> {
        require!(
            new_name.as_bytes().len() <= UserAccount::MAX_NAME,
            ErrorCode::NameTooLong
        );

        let user = &mut ctx.accounts.user_account;
        msg!("✏️ Updating user: {}", user.key());
        msg!("   Old name: {}", user.name);
        user.name = new_name.clone();
        msg!("   New name: {}", new_name);
        Ok(())
    }

    /// Close account and refund rent to the authority (owner).
    pub fn close_user(_ctx: Context<CloseUser>) -> Result<()> {
        msg!("🧹 Closed user PDA and refunded rent.");
        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub owner: Pubkey,              // 32
    #[max_len(32)]
    pub name: String,               // 4 + up to 32 bytes
    pub created_at: i64,            // 8
    pub bump: u8,                   // 1
}

impl UserAccount {
    pub const MAX_NAME: usize = 32;
    // Total space to allocate at init time:
    // 8 (discriminator) + INIT_SPACE computed by Anchor from the struct
    pub const SPACE: usize = 8 + Self::INIT_SPACE;
}

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// PDA: seeds = ["user", authority]
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
        constraint = user_account.owner == authority.key(),
        seeds = [b"user", authority.key().as_ref()],
        bump = user_account.bump
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
        constraint = user_account.owner == authority.key(),
        seeds = [b"user", authority.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<'info, UserAccount>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Name too long (max 32 bytes).")]
    NameTooLong,
}
