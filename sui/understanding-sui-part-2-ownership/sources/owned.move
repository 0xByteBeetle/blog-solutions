module sui_ownership::owned;

const EWrongNotebook: u64 = 0;

public struct Notebook has key, store {
    id: UID,
    value: u64,
}

public struct NotebookCap has key, store {
    id: UID,
    notebook: ID,
}

public fun create(value: u64, ctx: &mut TxContext): (Notebook, NotebookCap) {
    let note = Notebook { id: object::new(ctx), value };
    let cap = NotebookCap { id: object::new(ctx), notebook: object::id(&note) };
    (note, cap)
}

#[allow(lint(self_transfer))]
public fun create_owned(value: u64, ctx: &mut TxContext) {
    let (note, cap) = create(value, ctx);
    transfer::transfer(note, ctx.sender());
    transfer::transfer(cap, ctx.sender());
}

public fun value(note: &Notebook): u64 { note.value }

public fun set_value(note: &mut Notebook, cap: &NotebookCap, value: u64) {
    assert!(object::id(note) == cap.notebook, EWrongNotebook);
    note.value = value;
}

#[test_only]
public fun destroy_for_testing(note: Notebook, cap: NotebookCap) {
    let Notebook { id, value: _ } = note;
    object::delete(id);
    let NotebookCap { id, notebook: _ } = cap;
    object::delete(id);
}

#[test]
fun matching_cap_updates_value() {
    let mut ctx = tx_context::dummy();
    let (mut note, cap) = create(7, &mut ctx);
    set_value(&mut note, &cap, 9);
    assert!(value(&note) == 9, 1);
    destroy_for_testing(note, cap);
}

#[test]
#[expected_failure(abort_code = 0, location = sui_ownership::owned)]
fun another_notebooks_cap_is_rejected() {
    let mut ctx = tx_context::dummy();
    let (mut note, cap) = create(7, &mut ctx);
    let (other, other_cap) = create(7, &mut ctx);
    set_value(&mut note, &other_cap, 9);
    destroy_for_testing(note, cap);
    destroy_for_testing(other, other_cap);
}
