//! Supplemental host-only checks against unchanged published code and response.
use published_hyperliquid_account_shapes::ClearinghouseState;
use serde_json::{json, Value};

const CLEARINGHOUSE: &str = include_str!("../fixtures/clearinghouse.json");

#[test]
fn published_clearinghouse_round_trips_without_changing_string_values() {
    let expected: Value = serde_json::from_str(CLEARINGHOUSE).unwrap();
    let state: ClearinghouseState = serde_json::from_str(CLEARINGHOUSE).unwrap();
    assert_eq!(serde_json::to_value(&state).unwrap(), expected);
    assert_eq!(state.time, expected["time"].as_u64().unwrap());
    assert_eq!(state.withdrawable, expected["withdrawable"].as_str().unwrap());
    assert!(state.asset_positions.is_empty());
}

#[test]
fn numeric_json_values_are_not_silently_coerced_to_strings() {
    let fixture: Value = serde_json::from_str(CLEARINGHOUSE).unwrap();
    for field in ["withdrawable", "crossMaintenanceMarginUsed"] {
        let mut changed = fixture.clone();
        changed[field] = json!(0);
        assert!(serde_json::from_value::<ClearinghouseState>(changed).is_err());
    }
    for summary in ["marginSummary", "crossMarginSummary"] {
        for field in ["accountValue", "totalNtlPos", "totalRawUsd", "totalMarginUsed"] {
            let mut changed = fixture.clone();
            changed[summary][field] = json!(0);
            assert!(serde_json::from_value::<ClearinghouseState>(changed).is_err());
        }
    }
}

#[test]
fn time_requires_unsigned_integer_and_required_fields_remain_required() {
    let fixture: Value = serde_json::from_str(CLEARINGHOUSE).unwrap();
    for invalid_time in [json!(-1), json!("1776982271519"), json!(1.5)] {
        let mut changed = fixture.clone();
        changed["time"] = invalid_time;
        assert!(serde_json::from_value::<ClearinghouseState>(changed).is_err());
    }
    let mut changed = fixture;
    changed.as_object_mut().unwrap().remove("withdrawable");
    assert!(serde_json::from_value::<ClearinghouseState>(changed).is_err());
}
