#[test_only]
module sui_foundations::notebook_tests;

use sui_foundations::notebook;

#[test]
fun test_create_and_update() {
    let mut ctx = tx_context::dummy();
    let (mut note, cap) = notebook::create(7, &mut ctx);
    let original_id = object::id(&note);
    assert!(notebook::value(&note) == 7, 1);
    notebook::set_value(&mut note, &cap, 9);
    assert!(notebook::value(&note) == 9, 2);
    assert!(object::id(&note) == original_id, 3);
    notebook::destroy_for_testing(note, cap);
}

#[test]
fun test_distinct_ids() {
    let mut ctx = tx_context::dummy();
    let (first, first_cap) = notebook::create(7, &mut ctx);
    let (second, second_cap) = notebook::create(7, &mut ctx);
    assert!(object::id(&first) != object::id(&second), 4);
    notebook::destroy_for_testing(first, first_cap);
    notebook::destroy_for_testing(second, second_cap);
}

#[test]
#[expected_failure(abort_code = 0, location = sui_foundations::notebook)]
fun test_wrong_capability() {
    let mut ctx = tx_context::dummy();
    let (mut first, first_cap) = notebook::create(7, &mut ctx);
    let (second, second_cap) = notebook::create(7, &mut ctx);
    notebook::set_value(&mut first, &second_cap, 9);
    notebook::destroy_for_testing(first, first_cap);
    notebook::destroy_for_testing(second, second_cap);
}
