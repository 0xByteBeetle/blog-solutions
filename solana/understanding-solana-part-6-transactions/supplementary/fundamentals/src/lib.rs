use borsh::{BorshDeserialize, BorshSerialize};
use solana_sdk::{
    account::Account,
    hash::Hash,
    instruction::{AccountMeta, Instruction},
    message::{v0, AddressLookupTableAccount, Message, VersionedMessage},
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::{Transaction, VersionedTransaction},
};

/// A small instruction payload used to make the article's serialization
/// examples executable. Borsh writes fields in declaration order and uses
/// little-endian integers.
#[derive(Debug, Clone, PartialEq, Eq, BorshSerialize, BorshDeserialize)]
pub struct TransferPayload {
    pub discriminator: u8,
    pub amount: u64,
    pub memo: String,
}

pub fn transfer_instruction(
    program_id: Pubkey,
    authority: Pubkey,
    source: Pubkey,
    destination: Pubkey,
    amount: u64,
) -> Instruction {
    let data = borsh::to_vec(&TransferPayload {
        discriminator: 7,
        amount,
        memo: "blog example".to_owned(),
    })
    .expect("serializing an in-memory payload cannot fail");

    Instruction::new_with_bytes(
        program_id,
        &data,
        vec![
            AccountMeta::new_readonly(authority, true),
            AccountMeta::new(source, false),
            AccountMeta::new(destination, false),
        ],
    )
}

/// Priority fees are quoted in micro-lamports per compute unit. Integer
/// division rounds down, matching the unit conversion shown in the article.
pub fn total_fee_lamports(
    signatures: u64,
    lamports_per_signature: u64,
    compute_unit_limit: u64,
    micro_lamports_per_compute_unit: u64,
) -> u64 {
    let base_fee = signatures.saturating_mul(lamports_per_signature);
    let priority_fee = compute_unit_limit
        .saturating_mul(micro_lamports_per_compute_unit)
        / 1_000_000;
    base_fee.saturating_add(priority_fee)
}

pub fn signed_legacy_transaction(
    payer: &Keypair,
    instruction: Instruction,
    recent_blockhash: Hash,
) -> Transaction {
    Transaction::new_signed_with_payer(
        &[instruction],
        Some(&payer.pubkey()),
        &[payer],
        recent_blockhash,
    )
}

pub fn signed_v0_transaction(
    payer: &Keypair,
    instruction: Instruction,
    recent_blockhash: Hash,
    lookup_table: AddressLookupTableAccount,
) -> VersionedTransaction {
    let message = v0::Message::try_compile(
        &payer.pubkey(),
        &[instruction],
        &[lookup_table],
        recent_blockhash,
    )
    .expect("the fixture uses fewer than 256 account keys");

    VersionedTransaction::try_new(VersionedMessage::V0(message), &[payer])
        .expect("the payer signs the only required signature")
}

pub fn account_fixture(owner: Pubkey, lamports: u64, data: Vec<u8>) -> Account {
    Account {
        lamports,
        data,
        owner,
        executable: false,
        rent_epoch: 0,
    }
}

pub fn derive_profile_pda(program_id: &Pubkey, authority: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"profile", authority.as_ref()], program_id)
}

pub fn legacy_message(instruction: &Instruction, payer: &Pubkey) -> Message {
    Message::new(&[instruction.clone()], Some(payer))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn keys() -> (Keypair, Pubkey, Pubkey, Pubkey) {
        (
            Keypair::new(),
            Pubkey::new_unique(),
            Pubkey::new_unique(),
            Pubkey::new_unique(),
        )
    }

    #[test]
    fn account_model_keeps_balance_owner_data_and_executable_separate() {
        let owner = Pubkey::new_unique();
        let account = account_fixture(owner, 2_000_000, vec![1, 2, 3, 4]);

        assert_eq!(account.lamports, 2_000_000);
        assert_eq!(account.owner, owner);
        assert_eq!(account.data, vec![1, 2, 3, 4]);
        assert!(!account.executable);
    }

    #[test]
    fn pda_is_deterministic_and_off_curve() {
        let program_id = Pubkey::new_unique();
        let authority = Pubkey::new_unique();
        let first = derive_profile_pda(&program_id, &authority);
        let second = derive_profile_pda(&program_id, &authority);

        assert_eq!(first, second);
        assert!(Pubkey::create_program_address(
            &[b"profile", authority.as_ref(), &[first.1]],
            &program_id
        )
        .is_ok());
    }

    #[test]
    fn borsh_payload_has_predictable_little_endian_layout() {
        let payload = TransferPayload {
            discriminator: 7,
            amount: 500,
            memo: "ok".to_owned(),
        };
        let bytes = borsh::to_vec(&payload).unwrap();

        assert_eq!(bytes[0], 7);
        assert_eq!(&bytes[1..9], &500_u64.to_le_bytes());
        assert_eq!(&bytes[9..13], &2_u32.to_le_bytes());
        assert_eq!(&bytes[13..], b"ok");
        assert_eq!(TransferPayload::try_from_slice(&bytes).unwrap(), payload);
    }

    #[test]
    fn message_compiles_account_permissions_into_header_and_indices() {
        let (payer, program_id, source, destination) = keys();
        let instruction = transfer_instruction(
            program_id,
            payer.pubkey(),
            source,
            destination,
            42,
        );
        let message = legacy_message(&instruction, &payer.pubkey());

        assert_eq!(message.header.num_required_signatures, 1);
        assert_eq!(message.account_keys[0], payer.pubkey());
        assert_eq!(message.instructions.len(), 1);
        assert_eq!(message.instructions[0].data, instruction.data);
        assert_eq!(message.instructions[0].accounts.len(), 3);
    }

    #[test]
    fn signature_covers_the_serialized_message() {
        let (payer, program_id, source, destination) = keys();
        let instruction = transfer_instruction(
            program_id,
            payer.pubkey(),
            source,
            destination,
            42,
        );
        let transaction = signed_legacy_transaction(&payer, instruction, Hash::new_unique());

        assert_eq!(transaction.signatures.len(), 1);
        assert!(transaction.signatures[0]
            .verify(payer.pubkey().as_ref(), &transaction.message_data()));
    }

    #[test]
    fn fee_formula_combines_base_and_priority_fees() {
        assert_eq!(total_fee_lamports(2, 5_000, 200_000, 10_000), 12_000);
    }

    #[test]
    fn lookup_table_moves_non_signer_keys_out_of_static_account_keys() {
        let (payer, program_id, source, destination) = keys();
        let instruction = transfer_instruction(
            program_id,
            payer.pubkey(),
            source,
            destination,
            42,
        );
        let lookup_table = AddressLookupTableAccount {
            key: Pubkey::new_unique(),
            addresses: vec![source, destination],
        };
        let transaction = signed_v0_transaction(
            &payer,
            instruction,
            Hash::new_unique(),
            lookup_table,
        );

        let VersionedMessage::V0(message) = &transaction.message else {
            panic!("expected a v0 message");
        };
        assert_eq!(message.address_table_lookups.len(), 1);
        assert_eq!(message.address_table_lookups[0].writable_indexes, vec![0, 1]);
        assert!(!message.account_keys.contains(&source));
        assert!(!message.account_keys.contains(&destination));
    }
}
