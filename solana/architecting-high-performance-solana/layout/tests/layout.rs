//! Supplemental assertions against the unchanged published struct.
//! Host tests only: no account creation, validator, keypair, or transaction.
use published_zero_copy_layout::MarketState;
use std::mem::{align_of, offset_of, size_of};

#[test]
fn market_state_has_published_size_alignment_and_offsets() {
    assert_eq!(size_of::<MarketState>(), 24);
    assert_eq!(align_of::<MarketState>(), 8);
    assert_eq!(offset_of!(MarketState, version), 0);
    assert_eq!(offset_of!(MarketState, _padding1), 1);
    assert_eq!(offset_of!(MarketState, volume), 8);
    assert_eq!(offset_of!(MarketState, is_active), 16);
    assert_eq!(offset_of!(MarketState, _padding2), 17);
}

#[test]
fn default_initializes_every_byte_including_explicit_padding() {
    let state = MarketState::default();
    assert_eq!(bytemuck::bytes_of(&state), &[0_u8; 24]);
}

// The published byte map assumes a little-endian host (as does Solana SBF).
// This test is intentionally absent on a big-endian host, not a claim that
// repr(C) supplies a portable wire byte order.
#[cfg(target_endian = "little")]
#[test]
fn little_endian_byte_map_matches_fields_and_explicit_padding() {
    let state = MarketState {
        version: 1,
        volume: 0x0807_0605_0403_0201,
        is_active: 1,
        ..MarketState::default()
    };
    let expected: [u8; 24] = [
        1, 0, 0, 0, 0, 0, 0, 0,
        1, 2, 3, 4, 5, 6, 7, 8,
        1, 0, 0, 0, 0, 0, 0, 0,
    ];
    assert_eq!(bytemuck::bytes_of(&state), &expected);
}

#[test]
fn explicit_padding_is_real_data_not_implicitly_cleared() {
    let state = MarketState {
        version: 2,
        _padding1: [0xa5; 7],
        volume: 9,
        is_active: 0,
        _padding2: [0x5a; 7],
    };
    let bytes = bytemuck::bytes_of(&state);
    assert_eq!(&bytes[1..8], &[0xa5; 7]);
    assert_eq!(&bytes[8..16], &9_u64.to_ne_bytes());
    assert_eq!(&bytes[17..24], &[0x5a; 7]);
}
