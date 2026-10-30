# Published examples

Source: https://andreyobruchkov1996.substack.com/p/solana-deep-dive-unpacking-borsh

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `6522974989e6bc769ebefebdc979949c3aa63d91304968a14b4a58d586160a4b`

````text
pub struct TokenData {
    pub is_initialized: bool, // 1 byte
    pub supply: u64,          // 8 bytes
}
````

## Block 2

SHA-256: `b2ee74e6fc9f912ce436bd64fd15f8e3f9cfd0f79aa152829d0c690a2dcc0843`

````text
use anchor_lang::prelude::*;

declare_id!("YourProgramIdHere...");

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
````

## Block 3

SHA-256: `a164d94f903df5ae00a9a3e4f92b4106246c1e8c2602f2a3cfb07071d2894aca`

````text
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BorshDeepDive } from "../target/types/borsh_deep_dive";
import { Keypair } from "@solana/web3.js";

describe("borsh_deep_dive", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.BorshDeepDive as Program<BorshDeepDive>;

  it("Initializes and prints the raw byte array!", async () => {
    const profileKeypair = Keypair.generate();
    const age = 25;
    const balance = new anchor.BN(1000); 

    // Execute the transaction
    await program.methods
      .initializeProfile(age, balance)
      .accounts({
        userProfile: profileKeypair.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([profileKeypair])
      .rpc();

    // Fetch the RAW account info directly from the RPC
    const accountInfo = await provider.connection.getAccountInfo(
      profileKeypair.publicKey
    );

    // Print the raw Buffer as an array of decimal integers
    console.log("Raw Account Buffer:", Array.from(accountInfo.data));
  });
});
````

## Block 4

SHA-256: `20722c87ac188b38dca9ebcb87bf8ddd52f3be4a76df414c65577cfc49a28cc5`

````text
[32, 37, 119, 205, 179, 180, 13, 194, 25, 232, 3, 0, 0, 0, 0, 0, 0]
````

## Block 5

SHA-256: `d819ee59633363c9687d4b159f0dee5961ea239cedcdc3da4d755339c7a88f96`

````text
202577cdb3b40dc24363677025514d68469b442175b89c914148a5765f86c951 
````

## Block 6

SHA-256: `21d91ef8dbe3646c7b53359c5fbf2d871226b246937fb58a09de83dc359807b9`

````text
[32, 37, 119, 205, 179, 180, 13, 194]
````

## Block 7

SHA-256: `9a55318d2476e12fd9cabbd299790858a49f895358f2b251d036d57dba7d7764`

````text
[232, 3, 0, 0, 0, 0, 0, 0]
````

## Block 8

SHA-256: `20722c87ac188b38dca9ebcb87bf8ddd52f3be4a76df414c65577cfc49a28cc5`

````text
[32, 37, 119, 205, 179, 180, 13, 194, 25, 232, 3, 0, 0, 0, 0, 0, 0]
````

## Block 9

SHA-256: `c270dd8d53d674c4c1c48588b6094c870203bc5af01c2c266704cfb41298d900`

````text
#[account]
pub struct DaoProposal {
    pub active: Option<bool>, 
    pub title: String,        
    pub voters: Vec<Pubkey>,  
}
````

## Block 10

SHA-256: `2a8c2ed3cf01c152172691178f79e09a2071f6d8520aad1fd4bf62752d14bc49`

````text
const active = true; // Maps to Some(true)
const title = "GM";
const voters = [SystemProgram.programId]; // 1 pubkey (32 bytes of zeros)
````

## Block 11

SHA-256: `58768112ed50e937b45747e6f959a9405d0fdbd7036a7477417d6bab529a7083`

````text
Raw Dynamic Buffer: [
  // The 8-byte Anchor Discriminator for "DaoProposal"
  140, 16, 138, 15, 20, 224, 135, 137, 
  
  // The Option<bool> (2 bytes)
  1,   // The prefix signaling "Some"
  1,   // The boolean value "true"
  
  // The String "GM" (6 bytes)
  2, 0, 0, 0,  // The u32 length prefix (2 characters)
  71, 77,      // The UTF-8 decimal bytes for 'G' and 'M'
  
  // The Vec<Pubkey> (36 bytes)
  1, 0, 0, 0,  // The u32 length prefix (1 item in the vector)
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0  // (System Program Pubkey)
]
````

## Block 12

SHA-256: `277f523a8fa71d321e933f31ffbc0a5d26073b8693ea3737dd956e2b24f06909`

````text
if x.is_some() {
    repr(1 as u8)
    repr(x.unwrap() as ident)
} else {
    repr(0 as u8)
}
````

## Block 13

SHA-256: `b10b9c9fd51fb49040261feb2658b9ce1a46fdab5b132cf760963cc3cab49ece`

````text
repr(len() as u32)
for el in x { ... }
````
