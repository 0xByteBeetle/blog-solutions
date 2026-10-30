use solana_blog_fundamentals::{
    derive_profile_pda, signed_legacy_transaction, total_fee_lamports, transfer_instruction,
};
use solana_sdk::{hash::Hash, pubkey::Pubkey, signature::{Keypair, Signer}};

fn main() {
    let payer = Keypair::new();
    let program_id = Pubkey::new_unique();
    let source = Pubkey::new_unique();
    let destination = Pubkey::new_unique();
    let instruction = transfer_instruction(
        program_id,
        payer.pubkey(),
        source,
        destination,
        500,
    );
    let transaction = signed_legacy_transaction(&payer, instruction, Hash::new_unique());
    let (profile, bump) = derive_profile_pda(&program_id, &payer.pubkey());

    println!("message accounts: {}", transaction.message.account_keys.len());
    println!("required signatures: {}", transaction.message.header.num_required_signatures);
    println!("signature verified: {}", transaction.signatures[0].verify(
        payer.pubkey().as_ref(),
        &transaction.message_data(),
    ));
    println!("profile PDA: {profile} (bump {bump})");
    println!("example fee: {} lamports", total_fee_lamports(1, 5_000, 200_000, 10_000));
}
