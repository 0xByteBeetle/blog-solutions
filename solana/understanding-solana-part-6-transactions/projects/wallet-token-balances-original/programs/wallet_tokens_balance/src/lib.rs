use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::set_return_data, program_pack::Pack};
use anchor_spl::{token, token_2022};


declare_id!("ATUwBNQMJRM4cVEVGLGZksaU3i5cAMoTN8xoZ64BBGzN");

fn ata_for_token(owner: &Pubkey, mint: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(&[owner.as_ref(), anchor_spl::token::ID.as_ref(), mint.as_ref()],
        &anchor_spl::associated_token::ID,           // Associated Token Program id
    ).0
}

fn ata_for_token22(owner: &Pubkey, mint: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(&[owner.as_ref(), anchor_spl::token_2022::ID.as_ref(), mint.as_ref()],
        &anchor_spl::associated_token::ID,           // Associated Token Program id
    ).0
}

#[program]
pub mod wallet_token_balances {
    use super::*;

    pub fn get_balances(ctx: Context<GetBalances>, wallet_mints: Vec<WalletMints>) -> Result<()> {
        // Build output: Vec<Balance> (wallet, mint, amount)
        let mut out: Vec<Balance> = Vec::new();

        // Map remaining accounts for quick lookup
        use std::collections::HashMap;
        let mut rem: HashMap<Pubkey, &AccountInfo> = HashMap::with_capacity(ctx.remaining_accounts.len());
        for ai in ctx.remaining_accounts.iter() {
            rem.insert(*ai.key, ai);
        }

        // For each wallet and its mint list
        for wm in wallet_mints.iter() {
            for mint in wm.mints.iter() {
                // let ata = get_associated_token_address(&wm.wallet, mint);

                let ata_v1  = ata_for_token(&wm.wallet, mint);
                let ata_v22 = ata_for_token22(&wm.wallet, mint);

                // Prefer whichever ATA the client actually passed in remaining_accounts
                let ai_opt = rem.get(&ata_v1).copied().or_else(|| rem.get(&ata_v22).copied());

                let amount: u64 = match ai_opt {
                    Some(ai) if *ai.owner == token::ID => {
                        let data_ref = ai.data.borrow();
                        match token::spl_token::state::Account::unpack_from_slice(&data_ref) {
                            Ok(ta) if ta.owner == wm.wallet && ta.mint == *mint => ta.amount,
                            _ => 0,
                        }
                    }
                    Some(ai) if *ai.owner == token_2022::ID => {
                        let data_ref = ai.data.borrow();
                        match token_2022::spl_token_2022::state::Account::unpack_from_slice(&data_ref) {
                            Ok(ta) if ta.owner == wm.wallet && ta.mint == *mint => ta.amount,
                            _ => 0,
                        }
                    }
                    _ => 0,
                };

                out.push(Balance {
                    wallet: wm.wallet,
                    mint: *mint,
                    amount,
                });
            }
        }

        // Return all results
        let bytes = out.try_to_vec()?;
        set_return_data(&bytes);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct GetBalances {}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct WalletMints {
    pub wallet: Pubkey,
    pub mints: Vec<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct Balance {
    pub wallet: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
}