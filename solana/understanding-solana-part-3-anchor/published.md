# Published examples

Source: https://andreyobruchkov1996.substack.com/p/understanding-solana-part-3-anchor

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `0584c7e4fb88a650e097d746dcfba816e48e9b4ad7d9c881c37ca65fa3adf20a`

````text
# 1. Download/install the Agave installer script
sh -c “$(curl -sSfL https://release.anza.xyz/stable/install)”

# 2. Setting up the PATH env var so everything work together
export PATH=”$HOME/.local/share/solana/install/active_release/bin:$PATH”

# To make it permanent (zsh), or change zshrc to your shell
# echo ‘export PATH=”$HOME/.local/share/solana/install/active_release/bin:$PATH”’ >> ~/.zshrc
# source ~/.zshrc

# if avm --version is not 0.31.1. do this:
# avm install 0.31.1
# avm use 0.31.1

# 3. Verify installation
cargo-build-sbf --version
# You should see something like:
# solana-cargo-build-sbf 3.0.10
# platform-tools v1.51
# rustc 1.84.1
````

## Block 2

SHA-256: `c9611cc6956be643f91451931a0ed3a7246de26b0898ba424f4cde6032a05cca`

````text
anchor init solana_accounts
cd solana_accounts
````

## Block 3

SHA-256: `5f97fa02d44f8413e1dd09d93ceecd441f207077a66c91e2733b16dbb0bf1721`

````text
use anchor_lang::prelude::*;

declare_id!(”<YOUR-PROGRAM-ID>”);

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

        msg!(”✅ Created user PDA: {}”, user.key());
        msg!(”   Owner: {}”, user.owner);
        msg!(”   Name: {}”, name);
        msg!(”   Created at: {}”, user.created_at);
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
        msg!(”✏️ Updating user: {}”, user.key());
        msg!(”   Old name: {}”, user.name);
        user.name = new_name.clone();
        msg!(”   New name: {}”, new_name);
        Ok(())
    }

    /// Close account and refund rent to the authority (owner).
    pub fn close_user(_ctx: Context<CloseUser>) -> Result<()> {
        msg!(”🧹 Closed user PDA and refunded rent.”);
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
pub struct CreateUser<’info> {
    #[account(mut)]
    pub authority: Signer<’info>,

    /// PDA: seeds = [”user”, authority]
    #[account(
        init,
        payer = authority,
        space = UserAccount::SPACE,
        seeds = [b”user”, authority.key().as_ref()],
        bump
    )]
    pub user_account: Account<’info, UserAccount>,

    pub system_program: Program<’info, System>,
}

#[derive(Accounts)]
pub struct UpdateUser<’info> {
    pub authority: Signer<’info>,

    #[account(
        mut,
        constraint = user_account.owner == authority.key(),
        seeds = [b”user”, authority.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<’info, UserAccount>,
}

#[derive(Accounts)]
pub struct CloseUser<’info> {
    #[account(mut)]
    pub authority: Signer<’info>,

    #[account(
        mut,
        close = authority,
        constraint = user_account.owner == authority.key(),
        seeds = [b”user”, authority.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<’info, UserAccount>,
}

#[error_code]
pub enum ErrorCode {
    #[msg(”Name too long (max 32 bytes).”)]
    NameTooLong,
}
````

## Block 4

SHA-256: `fc07dbcb05b641301a3262caaa25e314f9a8994020c5346569975af2b5edc895`

````text
declare_id!(”<YOUR-PROGRAM-ID>”);
````

## Block 5

SHA-256: `16811d0b170bdb622afa1297efce73605cfc9311452ae368403ea205ae6302d2`

````text
#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub owner: Pubkey,              // 32
    #[max_len(32)]
    pub name: String,               // 4 + up to 32 bytes
    pub created_at: i64,            // 8
    pub bump: u8,                   // 1
}
````

## Block 6

SHA-256: `5e50996f67019071e29306116f738fef839a4b6950f50f2f7798cf269390c916`

````text
seeds = [b”user”, authority.key().as_ref()], bump = user_account.bump
````

## Block 7

SHA-256: `6b5126f5eb38895b7e2b0d1bf81c2d3ee5e68e5b9e7228271a64889845e2285c`

````text
#[derive(Accounts)]
pub struct CreateUser<’info> {
    #[account(mut)]
    pub authority: Signer<’info>,

    /// PDA: seeds = [”user”, authority]
    #[account(
        init,
        payer = authority,
        space = UserAccount::SPACE,
        seeds = [b”user”, authority.key().as_ref()],
        bump
    )]
    pub user_account: Account<’info, UserAccount>,

    pub system_program: Program<’info, System>,
}
````

## Block 8

SHA-256: `76f573be823578f3510b615259b6fea53a8a15498d74f7398070eb2c58effe8b`

````text
pub fn create_user(ctx: Context<CreateUser>, name: String) -> Result<()> {
        // Enforce max length in BYTES (UTF-8). Emojis count as multiple bytes.
        require!(
            name.as_bytes().len() <= UserAccount::MAX_NAME,
            ErrorCode::NameTooLong
        );

        let user = &mut ctx.accounts.user_account;
        // Stores the wallet that created this profile
        user.owner = ctx.accounts.authority.key();
        // This assigns into the fixed allocated space Anchor reserved via #[max_len]
        user.name = name.clone(); // fits because we sized with MAX_NAME
        // Clock sysvar contains the current cluster time
        user.created_at = Clock::get()?.unix_timestamp;
        // Why store the bump:
        //   we used: PDA = find_program_address([”user”, authority], bump)
        //   We don’t want to recompute bump manually later
        //   update_name and close_user enforce (We will see it later)
        user.bump = ctx.bumps.user_account;
        ...
}
````

## Block 9

SHA-256: `425cd4d04b554fe39348c131bcea9c4a63447abd5889314551d08d52c8ee887d`

````text
#[derive(Accounts)]
pub struct UpdateUser<’info> {
    // Same as before, why not mut? no lamports changed here
    pub authority: Signer<’info>,
    
    // mut - because we modify the name, If you remove mut, Solana will reject the transaction
    // This is our access control rule, It ensures that only the original creator of the profile can update it
    // seeds - ensure correct automatic derivation
    // bump - because the PDA was initialized earlier using ctx.bumps.user_account.Storing and reusing the bump guarantees PDA stability.
    #[account(
        mut,
        constraint = user_account.owner == authority.key(),
        seeds = [b”user”, authority.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<’info, UserAccount>,
}
````

## Block 10

SHA-256: `c2f12f60986773a1f0db05e23cb5f3771ce2595ff64de3a89588547b931ff4b4`

````text
pub fn update_name(ctx: Context<UpdateUser>, new_name: String) -> Result<()> {
        // Enforce max length in BYTES (UTF-8). Emojis count as multiple bytes.
        require!(
            new_name.as_bytes().len() <= UserAccount::MAX_NAME,
            ErrorCode::NameTooLong
        );

        let user = &mut ctx.accounts.user_account;
        msg!(”✏️ Updating user: {}”, user.key());
        msg!(”   Old name: {}”, user.name);
        user.name = new_name.clone();
        msg!(”   New name: {}”, new_name);
        Ok(())
    }
````

## Block 11

SHA-256: `6e5db8a06282c3a298d7811b61015894b9f466efc6fea8330a73822f35b0c146`

````text
#[derive(Accounts)]
pub struct CloseUser<’info> {
    // Same as previous, this time is mut because balance increases with the refunded rent
    #[account(mut)]
    pub authority: Signer<’info>,

    // mut: we’re modifying (actually zeroing/closing) this account.
    // close: tells Anchor to refund all lamports from user_account to authority and then close the account when the instruction finishes. You don’t call anything manually—Anchor performs the close in the account’s “drop” (teardown) phase.
    // seeds: same as previous
    // bump: same as previous
    #[account(
        mut,
        close = authority,
        constraint = user_account.owner == authority.key(),
        seeds = [b”user”, authority.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<’info, UserAccount>,
}
````

## Block 12

SHA-256: `49a31cb510588a3bc5459e6d96898478f88157bdf54e4264c8ee5afc13ea58dd`

````text
// Everything is done automatically
pub fn close_user(_ctx: Context<CloseUser>) -> Result<()> {
    msg!(”🧹 Closed user PDA and refunded rent.”);
    Ok(())
}
````

## Block 13

SHA-256: `8bc51d94cb8395b87346835ab2ff4de6b0e5a8b849939fc6ab40dd16bb24267f`

````text
import * as anchor from “@coral-xyz/anchor”;
import type { Program } from “@coral-xyz/anchor”;
import { LAMPORTS_PER_SOL, PublicKey } from “@solana/web3.js”;
import { SolanaAccounts } from “../target/types/solana_accounts”;

async function ensureAirdrop(connection: anchor.web3.Connection, pubkey: PublicKey, min = 2 * LAMPORTS_PER_SOL) {
  const bal = await connection.getBalance(pubkey);
  if (bal >= min) return;
  const sig = await connection.requestAirdrop(pubkey, min);
  await connection.confirmTransaction(sig, “confirmed”);
}

(async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Use Anchor workspace (uses generated IDL/types under target/)
  const program = anchor.workspace.solanaAccounts as Program<SolanaAccounts>;
  const wallet = provider.wallet as anchor.Wallet;

  // Make sure we have SOL (useful on localhost)
  try { await ensureAirdrop(provider.connection, wallet.publicKey); } catch {}

  // PDA: seeds = [”user”, authority]
  // Seeds must match the program’s #[account(seeds = [b”user”, authority])]. From Rust!
  const [userPda] = PublicKey.findProgramAddressSync(
    [Buffer.from(”user”), wallet.publicKey.toBuffer()],
    program.programId
  );

  console.log(”Wallet:”, wallet.publicKey.toBase58());
  console.log(”Program:”, program.programId.toBase58());
  console.log(”User PDA:”, userPda.toBase58());

  // 1) createUser
  //    Derivable accounts (PDAs) are autofilled by Anchor
  //    No need to pass programId or PDA here! it knows from the context.
  const sig1 = await program.methods
    .createUser(”0xByteBeetle”)
    .accounts({ authority: wallet.publicKey }) // derivable accounts are autofilled
    .rpc();
  console.log(”createUser tx:”, sig1);

  // Fethch and log the created account
  const acct1 = await program.account.userAccount.fetch(userPda);
  console.log(”After create:”, {
    owner: acct1.owner.toBase58(),
    name: acct1.name,
    created_at: new Date(acct1.createdAt.toNumber() * 1000).toISOString(),
    bump: acct1.bump,
  });

  // 2) updateName
  const sig2 = await program.methods
    .updateName(”bytebeetle”)
    .accounts({ authority: wallet.publicKey })
    .rpc();
  console.log(”updateName tx:”, sig2);

  const acct2 = await program.account.userAccount.fetch(userPda);
  console.log(”After update:”, { name: acct2.name });

  // 3) closeUser
  const sig3 = await program.methods
    .closeUser()
    .accounts({ authority: wallet.publicKey })
    .rpc();
  console.log(”closeUser tx:”, sig3);

  try {
    await program.account.userAccount.fetch(userPda);
  } catch {
    console.log(”PDA closed (fetch failed as expected).”);
  }

  console.log(”Done ✅”);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
````

## Block 14

SHA-256: `32f7da5297312783b8fdf52565e411f953a4f630c90d7898c1b92f58745331e3`

````text
solana-keygen new -o target/deploy/solana_accounts-keypair.json --no-bip39-passphrase
solana-keygen pubkey target/deploy/solana_accounts-keypair.json
# Paste this pubkey into:
#   - programs/solana_accounts/src/lib.rs: declare_id!(”...”)
#   - Anchor.toml: [programs.devnet].solana_accounts = “...”

anchor clean
anchor build
anchor deploy
````

## Block 15

SHA-256: `f69dfaffc4d1f8b99cfbfd0f950ac08cf7057ad8b7828e69dfd61c52c817c9a0`

````text
# Reminder: you need to run this before:
# export export ANCHOR_PROVIDER_URL=”https://api.devnet.solana.com”
# export ANCHOR_WALLET=”$HOME/.config/solana/id.json”

pnpm ts-node scripts/solana_accounts.ts
````
