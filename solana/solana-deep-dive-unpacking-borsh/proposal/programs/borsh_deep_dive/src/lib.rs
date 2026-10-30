// use anchor_lang::prelude::*;

// // Replace with your generated program ID
// declare_id!("Bo8J1of9EuuGw3DvSgTdV7Fug65oD7cERLsf5rzF6PG4");

// #[program]
// pub mod borsh_deep_dive {
//     use super::*;

//     pub fn initialize_profile(ctx: Context<InitializeProfile>, age: u8, balance: u64) -> Result<()> {
//         let profile = &mut ctx.accounts.user_profile;
//         profile.age = age;
//         profile.balance = balance;
//         Ok(())
//     }
// }

// #[derive(Accounts)]
// pub struct InitializeProfile<'info> {
//     #[account(
//         init,
//         payer = user,
//         space = 8 + 1 + 8, // 8 (Discriminator) + 1 (u8) + 8 (u64)
//     )]
//     pub user_profile: Account<'info, UserProfile>,
//     #[account(mut)]
//     pub user: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

// #[account]
// pub struct UserProfile {
//     pub age: u8,
//     pub balance: u64,
// }


use anchor_lang::prelude::*;

declare_id!("Bo8J1of9EuuGw3DvSgTdV7Fug65oD7cERLsf5rzF6PG4");

#[program]
pub mod borsh_deep_dive {
    use super::*;

    // We pass the dynamic data as instruction arguments
    pub fn initialize_proposal(
        ctx: Context<InitializeProposal>, 
        active: Option<bool>, 
        title: String, 
        voters: Vec<Pubkey>
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        proposal.active = active;
        proposal.title = title;
        proposal.voters = voters;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(active: Option<bool>, title: String, voters: Vec<Pubkey>)]
pub struct InitializeProposal<'info> {
    #[account(
        init,
        payer = user,
        // Let's calculate exactly what we need for our test:
        // 8 (Discriminator) 
        // + 2 (Option: 1 byte prefix + 1 byte bool) 
        // + 6 (String: 4 byte length + 2 byte chars for "GM") 
        // + 36 (Vec: 4 byte length + 32 byte Pubkey)
        space = 8 + 2 + 6 + 36 
    )]
    pub proposal: Account<'info, DaoProposal>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct DaoProposal {
    pub active: Option<bool>, 
    pub title: String,        
    pub voters: Vec<Pubkey>,  
}