module sui_ownership::forgery_failure;

use sui_ownership::notebook::NotebookCap;

public fun forge(notebook_id: ID, ctx: &mut TxContext): NotebookCap {
    NotebookCap {
        id: object::new(ctx),
        notebook: notebook_id,
    }
}
