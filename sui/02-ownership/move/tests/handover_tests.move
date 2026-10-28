#[test_only]
module sui_ownership::handover_tests;

use sui::test_scenario;
use sui_ownership::notebook::{Self, Notebook, NotebookCap};

const ALICE: address = @0xA;
const BOB: address = @0xB;

#[test]
fun test_complete_handover() {
    let mut scenario = test_scenario::begin(ALICE);
    notebook::create_owned(7, scenario.ctx());
    scenario.next_tx(ALICE);
    let mut note = scenario.take_from_sender<Notebook>();
    let cap = scenario.take_from_sender<NotebookCap>();
    let original_id = object::id(&note);
    notebook::set_value(&mut note, &cap, 9);
    scenario.return_to_sender(cap);
    transfer::public_transfer(note, BOB);
    scenario.next_tx(BOB);
    assert!(scenario.has_most_recent_for_sender<Notebook>(), 1);
    assert!(!scenario.has_most_recent_for_sender<NotebookCap>(), 2);
    scenario.next_tx(ALICE);
    assert!(!scenario.has_most_recent_for_sender<Notebook>(), 3);
    let cap = scenario.take_from_sender<NotebookCap>();
    transfer::public_transfer(cap, BOB);
    scenario.next_tx(BOB);
    let mut note = scenario.take_from_sender<Notebook>();
    let cap = scenario.take_from_sender<NotebookCap>();
    assert!(object::id(&note) == original_id, 4);
    notebook::set_value(&mut note, &cap, 11);
    assert!(notebook::value(&note) == 11, 5);
    scenario.return_to_sender(note);
    scenario.return_to_sender(cap);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 3, location = sui::test_scenario)]
fun test_bob_cannot_take_alices_capability() {
    let mut scenario = test_scenario::begin(ALICE);
    notebook::create_owned(7, scenario.ctx());
    scenario.next_tx(ALICE);
    let note = scenario.take_from_sender<Notebook>();
    transfer::public_transfer(note, BOB);
    scenario.next_tx(BOB);
    let cap = scenario.take_from_sender<NotebookCap>();
    scenario.return_to_sender(cap);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 3, location = sui::test_scenario)]
fun test_alice_cannot_take_bobs_notebook() {
    let mut scenario = test_scenario::begin(ALICE);
    notebook::create_owned(7, scenario.ctx());
    scenario.next_tx(ALICE);
    let note = scenario.take_from_sender<Notebook>();
    transfer::public_transfer(note, BOB);
    scenario.next_tx(ALICE);
    let note = scenario.take_from_sender<Notebook>();
    scenario.return_to_sender(note);
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 0, location = sui_ownership::notebook)]
fun test_matching_type_can_have_wrong_binding() {
    let mut ctx = tx_context::dummy();
    let (mut note, cap) = notebook::create(7, &mut ctx);
    let (other, other_cap) = notebook::create(7, &mut ctx);
    notebook::set_value(&mut note, &other_cap, 11);
    notebook::destroy_for_testing(note, cap);
    notebook::destroy_for_testing(other, other_cap);
}
