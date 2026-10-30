use anchor_lang::prelude::*;

declare_id!("Bo8J1of9EuuGw3DvSgTdV7Fug65oD7cERLsf5rzF6PG4");

#[program]
pub mod borsh_deep_dive {
    use super::*;

    pub fn initialize_profile(ctx: Context<InitializeProfile>, age: u8, balance: u64) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        profile.age = age;
        profile.balance = balance;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeProfile<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 1 + 8, // 8 (Discriminator) + 1 (u8) + 8 (u64)
    )]
    pub user_profile: Account<'info, UserProfile>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserProfile {
    pub age: u8,        // 1 byte
    pub balance: u64,   // 8 bytes
}
