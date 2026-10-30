module sui_foundations::notebook;

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
    let notebook = Notebook { id: object::new(ctx), value };
    let cap = NotebookCap {
        id: object::new(ctx),
        notebook: object::id(&notebook),
    };
    (notebook, cap)
}

public fun value(notebook: &Notebook): u64 {
    notebook.value
}

public fun set_value(notebook: &mut Notebook, cap: &NotebookCap, value: u64) {
    assert!(object::id(notebook) == cap.notebook, EWrongNotebook);
    notebook.value = value;
}

#[test_only]
public fun destroy_for_testing(notebook: Notebook, cap: NotebookCap) {
    let Notebook { id, value: _ } = notebook;
    object::delete(id);
    let NotebookCap { id, notebook: _ } = cap;
    object::delete(id);
}
