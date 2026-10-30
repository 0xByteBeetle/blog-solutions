missing_dex = "__missing_classroom__"
dex_entries = info.perp_dexs()

match = next(
    (
        item for item in dex_entries
        if isinstance(item, dict) and item.get("name") == missing_dex
    ),
    None,
)

if match is None:
    raise RuntimeError(
        f"DEX '{missing_dex}' was not returned by perpDexs on testnet"
    )
