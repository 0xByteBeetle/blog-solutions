module sui_ownership::case;

use sui_ownership::owned::{Self, Notebook, NotebookCap};

public struct Case has key, store {
    id: UID,
    notebook: Notebook,
}

#[allow(lint(self_transfer))]
public fun pack(notebook: Notebook, ctx: &mut TxContext) {
    transfer::transfer(Case { id: object::new(ctx), notebook }, ctx.sender());
}

public fun note_id(case: &Case): ID {
    object::id(&case.notebook)
}

public fun set_inside(case: &mut Case, cap: &NotebookCap, value: u64) {
    owned::set_value(&mut case.notebook, cap, value);
}

#[allow(lint(self_transfer))]
public fun unpack(case: Case, ctx: &mut TxContext) {
    let Case { id, notebook } = case;
    object::delete(id);
    transfer::public_transfer(notebook, ctx.sender());
}

#[test]
fun wrapped_notebook_keeps_identity() {
    let mut ctx = tx_context::dummy();
    let (notebook, cap) = owned::create(7, &mut ctx);
    let original_id = object::id(&notebook);
    let mut case = Case { id: object::new(&mut ctx), notebook };
    assert!(note_id(&case) == original_id, 1);
    set_inside(&mut case, &cap, 9);
    let Case { id, notebook } = case;
    object::delete(id);
    assert!(object::id(&notebook) == original_id, 2);
    assert!(owned::value(&notebook) == 9, 3);
    owned::destroy_for_testing(notebook, cap);
}
