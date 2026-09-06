use anchor_lang::prelude::*;
use bytemuck::{Pod, Zeroable};

declare_id!("Bo8J1of9EuuGw3DvSgTdV7Fug65oD7cERLsf5rzF6PG4");

#[program]
pub mod zero_copy_deep_dive {
    use super::*;

    // Initialize the account on-chain
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // load_init() sets the 8-byte Anchor discriminator and maps the buffer
        let mut market = ctx.accounts.market.load_init()?;
        market.version = 1;
        market.total_volume = 0;
        market.is_active = 1;
        
        msg!("Market initialized!");
        Ok(())
    }

    // Update the data using Zero-Copy
    pub fn update_volume(ctx: Context<UpdateMarket>, amount: u64) -> Result<()> {
        // load_mut() maps the existing account buffer for writing
        let mut market = ctx.accounts.market.load_mut()?;
        
        market.total_volume = market.total_volume.checked_add(amount).unwrap();
        
        msg!("Volume updated directly in memory to: {}", market.total_volume);
        Ok(())
    }
}

#[account(zero_copy)]
#[derive(Default, Debug)] 
pub struct MarketState {
    pub version: u8,        // 1 byte
    pub _padding1: [u8; 7], // 7 bytes padding for 8-byte alignment
    pub total_volume: u64,  // 8 bytes
    pub is_active: u8,      // 1 byte (using u8 instead of bool for Pod safety)
    pub _padding2: [u8; 7], // 7 bytes padding to make total size multiple of 8 (24 bytes)
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = authority, 
        space = 8 + std::mem::size_of::<MarketState>() // 8 (disc) + 24 (data) = 32 bytes
    )]
    pub market: AccountLoader<'info, MarketState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateMarket<'info> {
    #[account(mut)]
    pub market: AccountLoader<'info, MarketState>,
    pub authority: Signer<'info>,
}
