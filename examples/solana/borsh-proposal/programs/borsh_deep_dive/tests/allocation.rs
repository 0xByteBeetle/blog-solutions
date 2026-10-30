//! Supplemental host-only serialization checks. These do not execute Anchor init.
use anchor_lang::{prelude::Pubkey, AccountSerialize};
use borsh_deep_dive::DaoProposal;

const PUBLISHED_FIXTURE_ALLOCATION: usize = 8 + 2 + 6 + 36;

fn serialized(active: Option<bool>, title: &str, voters: Vec<Pubkey>) -> Vec<u8> {
    let proposal = DaoProposal { active, title: title.to_owned(), voters };
    let mut bytes = Vec::new();
    proposal.try_serialize(&mut bytes).expect("serialize fixture");
    bytes
}

#[test]
fn original_fixture_fits_exactly_with_discriminator() {
    let bytes = serialized(Some(true), "GM", vec![Pubkey::default()]);
    assert_eq!(bytes.len(), PUBLISHED_FIXTURE_ALLOCATION);
    // Account discriminator occupies bytes 0..8; Option<bool> is two bytes here.
    assert_eq!(&bytes[8..10], &[1, 1]);
    assert_eq!(&bytes[10..14], &2_u32.to_le_bytes());
    assert_eq!(&bytes[14..16], b"GM");
    assert_eq!(&bytes[16..20], &1_u32.to_le_bytes());
    assert_eq!(&bytes[20..], &[0_u8; 32]);
}

#[test]
fn fixed_allocation_is_not_a_general_dynamic_input_limit() {
    assert_eq!(serialized(Some(true), "GMI", vec![Pubkey::default()]).len(), 55);
    assert_eq!(serialized(Some(false), "GM", vec![Pubkey::default(); 2]).len(), 86);
    assert_eq!(serialized(None, "GM", vec![Pubkey::default()]).len(), 53);
    assert_eq!(serialized(None, "", vec![]).len(), 17);
    // Borsh string length is UTF-8 bytes, not Unicode scalar count.
    assert_eq!(serialized(Some(true), "€", vec![Pubkey::default()]).len(), 55);
}
