use anchor_lang::prelude::*;

declare_id!("3bSwAt5S78JAqp3153dd2Jrm6nscvYYW2MgamGXDvw9P");

#[program]
pub mod borsh_lab {
    use super::*;

    pub fn initialize_profile(
        ctx: Context<InitializeProfile>,
        age: u8,
        balance: u64,
    ) -> Result<()> {
        let profile = &mut ctx.accounts.profile;
        profile.age = age;
        profile.balance = balance;
        Ok(())
    }

    pub fn initialize_proposal(
        ctx: Context<InitializeProposal>,
        active: Option<bool>,
        title: String,
        voters: Vec<Pubkey>,
    ) -> Result<()> {
        require!(title.len() <= DaoProposal::MAX_TITLE_BYTES, BlogError::TitleTooLong);
        require!(voters.len() <= DaoProposal::MAX_VOTERS, BlogError::TooManyVoters);

        let proposal = &mut ctx.accounts.proposal;
        proposal.active = active;
        proposal.title = title;
        proposal.voters = voters;
        Ok(())
    }
}

#[account]
pub struct UserProfile {
    pub age: u8,
    pub balance: u64,
}

impl UserProfile {
    pub const SPACE: usize = 8 + 1 + 8;
}

#[account]
pub struct DaoProposal {
    pub active: Option<bool>,
    pub title: String,
    pub voters: Vec<Pubkey>,
}

impl DaoProposal {
    pub const MAX_TITLE_BYTES: usize = 64;
    pub const MAX_VOTERS: usize = 4;
    pub const SPACE: usize = 8 + 2 + 4 + Self::MAX_TITLE_BYTES + 4 + 32 * Self::MAX_VOTERS;
}

#[derive(Accounts)]
pub struct InitializeProfile<'info> {
    #[account(init, payer = user, space = UserProfile::SPACE)]
    pub profile: Account<'info, UserProfile>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeProposal<'info> {
    #[account(init, payer = user, space = DaoProposal::SPACE)]
    pub proposal: Account<'info, DaoProposal>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum BlogError {
    #[msg("The title exceeds the allocated 64 UTF-8 bytes")]
    TitleTooLong,
    #[msg("The proposal supports at most four voters in this lab")]
    TooManyVoters,
}
