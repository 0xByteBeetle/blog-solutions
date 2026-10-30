// Supplemental >10 KiB variant. The published 32-byte MarketState is unchanged.
use anchor_lang::prelude::*;
declare_id!("Bo8J1of9EuuGw3DvSgTdV7Fug65oD7cERLsf5rzF6PG4");

#[program]
pub mod large_zero_copy {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let mut market = ctx.accounts.market.load_init()?;
        market.authority = ctx.accounts.authority.key();
        market.version = 1;
        market.total_volume = 0;
        market.is_active = 1;
        Ok(())
    }
    pub fn update_volume(ctx: Context<UpdateMarket>, amount: u64) -> Result<()> {
        let mut market = ctx.accounts.market.load_mut()?;
        market.total_volume = market.total_volume.checked_add(amount).ok_or(LargeError::VolumeOverflow)?;
        Ok(())
    }
}

#[account(zero_copy)]
pub struct LargeMarket {
    pub authority: Pubkey,
    pub version: u64,
    pub total_volume: u64,
    pub is_active: u64,
    pub payload: [[u8; 32]; 512],
}
pub const SPACE: usize = 8 + std::mem::size_of::<LargeMarket>(); // 16,448 > 10,240.

#[derive(Accounts)]
pub struct Initialize<'info> {
    // Client must allocate and assign ownership in a separate System Program transaction.
    #[account(zero, constraint = market.to_account_info().data_len() == SPACE @ LargeError::WrongSize)]
    pub market: AccountLoader<'info, LargeMarket>,
    pub authority: Signer<'info>,
}
#[derive(Accounts)]
pub struct UpdateMarket<'info> {
    #[account(mut, constraint = market.load()?.authority == authority.key() @ LargeError::WrongAuthority)]
    pub market: AccountLoader<'info, LargeMarket>,
    pub authority: Signer<'info>,
}
#[error_code]
pub enum LargeError {
    #[msg("Account must have exactly 16,448 bytes")]
    WrongSize,
    #[msg("Only the initializer may update this supplemental fixture")]
    WrongAuthority,
    #[msg("Volume overflow")]
    VolumeOverflow,
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn large_layout() {
        assert_eq!(SPACE, 16448);
        assert!(SPACE > 10240);
        assert_eq!(std::mem::align_of::<LargeMarket>(), 8);
        assert_eq!(std::mem::offset_of!(LargeMarket, payload), 56);
    }
}
