use anchor_lang::prelude::*;

declare_id!("6LEQabRZV5yviGWzAFBw7qj1Dxc1sq7VKgJCcfyZiezi");

pub const LARGE_CANVAS_PIXELS: usize = 10_240;

#[program]
pub mod zero_copy {
    use super::*;

    pub fn initialize_market(ctx: Context<InitializeMarket>) -> Result<()> {
        let mut market = ctx.accounts.market.load_init()?;
        market.version = 1;
        market.is_active = 1;
        market.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn update_volume(ctx: Context<UpdateMarket>, amount: u64) -> Result<()> {
        let mut market = ctx.accounts.market.load_mut()?;
        market.total_volume = market
            .total_volume
            .checked_add(amount)
            .ok_or(BlogError::VolumeOverflow)?;
        Ok(())
    }

    pub fn initialize_large_canvas(ctx: Context<InitializeLargeCanvas>) -> Result<()> {
        let mut canvas = ctx.accounts.canvas.load_init()?;
        canvas.admin = ctx.accounts.admin.key();
        canvas.pixels[0] = 5;
        canvas.total_drawn = 1;
        Ok(())
    }

    pub fn draw_pixel(ctx: Context<DrawPixel>, index: u16, color: u8) -> Result<()> {
        let index = usize::from(index);
        require!(index < LargeCanvas::PIXEL_COUNT, BlogError::PixelOutOfRange);

        let mut canvas = ctx.accounts.canvas.load_mut()?;
        canvas.pixels[index] = color;
        canvas.total_drawn = canvas
            .total_drawn
            .checked_add(1)
            .ok_or(BlogError::DrawCountOverflow)?;
        Ok(())
    }
}

#[account(zero_copy)]
#[derive(Default, Debug)]
pub struct MarketState {
    pub version: u8,
    pub _padding_1: [u8; 7],
    pub total_volume: u64,
    pub is_active: u8,
    pub _padding_2: [u8; 7],
    pub authority: Pubkey,
}

#[account(zero_copy)]
pub struct LargeCanvas {
    pub admin: Pubkey,
    pub total_drawn: u64,
    pub pixels: [u8; LARGE_CANVAS_PIXELS],
}

impl LargeCanvas {
    pub const PIXEL_COUNT: usize = LARGE_CANVAS_PIXELS;
    pub const DATA_BYTES: usize = 32 + 8 + Self::PIXEL_COUNT;
    pub const SPACE: usize = 8 + Self::DATA_BYTES;
}

#[derive(Accounts)]
pub struct InitializeMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<MarketState>()
    )]
    pub market: AccountLoader<'info, MarketState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateMarket<'info> {
    #[account(mut, has_one = authority @ BlogError::WrongAuthority)]
    pub market: AccountLoader<'info, MarketState>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitializeLargeCanvas<'info> {
    #[account(zero)]
    pub canvas: AccountLoader<'info, LargeCanvas>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct DrawPixel<'info> {
    #[account(mut, has_one = admin @ BlogError::WrongAuthority)]
    pub canvas: AccountLoader<'info, LargeCanvas>,
    pub admin: Signer<'info>,
}

#[error_code]
pub enum BlogError {
    #[msg("The volume would overflow u64")]
    VolumeOverflow,
    #[msg("The pixel index is outside the canvas")]
    PixelOutOfRange,
    #[msg("The draw counter would overflow u64")]
    DrawCountOverflow,
    #[msg("Only the stored authority can mutate this zero-copy account")]
    WrongAuthority,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::mem::{align_of, size_of};

    #[test]
    fn explicit_padding_makes_the_small_layout_predictable() {
        assert_eq!(size_of::<MarketState>(), 56);
        assert_eq!(align_of::<MarketState>(), 8);
    }

    #[test]
    fn large_canvas_really_exceeds_the_anchor_init_cpi_limit() {
        assert_eq!(size_of::<LargeCanvas>(), LargeCanvas::DATA_BYTES);
        assert!(LargeCanvas::SPACE > 10_240);
    }
}
