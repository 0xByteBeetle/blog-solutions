# Published examples

Source: https://andreyobruchkov1996.substack.com/p/architecting-high-performance-solana

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `097a0af797570484a1b421d6f4f704aa1610c18c9d56ab2a17500e9cf9b316c3`

````text
#[repr(C)]
pub struct MarketState {
    pub version: u8,    // Offset 0
    pub bump: u8,       // Offset 1
    pub authority: [u8; 32], // Offset 2
}
````

## Block 2

SHA-256: `7f3be386891a091dad5985a65d8e1ee6ab560bcd1a120d895bd524ce0c4ad63f`

````text
use anchor_lang::prelude::*;
use bytemuck::{Pod, Zeroable};
use std::mem::{size_of, align_of};

#[repr(C)]
#[derive(Default, Debug, Clone, Copy, Pod, Zeroable)]
pub struct MarketState {
    pub version: u8,
    pub _padding1: [u8; 7], 
    pub volume: u64,
    pub is_active: u8,      // Use u8 instead of bool: 0 = false, 1 = true
    pub _padding2: [u8; 7], 
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_memory_layout() {
        let state = MarketState {
            version: 1,
            volume: 100,
            is_active: 1,
            ..Default::default()
        };

        println!("\n--- Memory Analysis ---");
        println!("Total Size: {} bytes", size_of::<MarketState>());
        println!("Alignment:  {} bytes", align_of::<MarketState>());
        println!("-----------------------");

        let bytes = bytemuck::bytes_of(&state);
        
        println!("Byte Map (Hex):");
        for (i, chunk) in bytes.chunks(8).enumerate() {
            println!("Row {}: {:02X?}", i, chunk);
        }
        println!("-----------------------\n");
    }
}
````

## Block 3

SHA-256: `00f37beab4e5b467676f8d1dc6fb4496ad0d855dde7df22e8a189b1d832ab41b`

````text
pub fn process_trade(ctx: Context<Trade>, amount: u64) -> Result<()> {
    // map the account data to the 'market' variable
    let mut market = ctx.accounts.market.load_mut()?;
    
    // market now behaves like a standard Rust struct
    market.total_volume += amount;
    
    // No need to call 'exit' or 'save'—the changes are 
    // written directly to the account buffer in real-time.
    Ok(())
}
````

## Block 4

SHA-256: `5d98b62b4566bf72500a685ccb6f24168b2fa5e648601b4fbbae2b6594b1938d`

````text
// AVOID THIS
let market = ctx.accounts.market.load_mut()?;
calculate_fees(market); // Passing ownership of the RefMut
market.volume += 10;    // ERROR: market was moved
````

## Block 5

SHA-256: `d73cd3b9bfc6bfb80d86ab37ac306430b20b97ecab4152a1c6d11fff1dfa9ba1`

````text
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
````

## Block 6

SHA-256: `68244dd301071a564c627bcc6e07b8c8dc36b69576cea7e8b014f978667acf7c`

````text
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ZeroCopyDeepDive } from "../target/types/zero_copy_deep_dive";
import { expect } from "chai";

describe("zero_copy_deep_dive", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.ZeroCopyDeepDive as Program<ZeroCopyDeepDive>;

    it("Initializes and Updates the volume!", async () => {
        const marketKeypair = anchor.web3.Keypair.generate();

        console.log("Available methods:", Object.keys(program.methods));

        // Initialize the account
        // This creates the account and changes owner from SystemProgram to our Program
        await program.methods
            .initialize()
            .accounts({
                market: marketKeypair.publicKey,
                authority: provider.wallet.publicKey,
            })
            .signers([marketKeypair])
            .rpc();

        console.log("Account initialized.");

        // Update the volume
        // This will now pass because the account is owned by the program
        const updateAmount = new anchor.BN(500);
        await program.methods
            .updateVolume(updateAmount)
            .accounts({
                market: marketKeypair.publicKey,
                authority: provider.wallet.publicKey,
            })
            .rpc();

        // Verify
        const account = await program.account.marketState.fetch(marketKeypair.publicKey);
        console.log("On-chain Volume:", account.totalVolume.toString());

        expect(account.totalVolume.toNumber()).to.equal(500);
        expect(account.isActive).to.equal(1);
    });
});
````
