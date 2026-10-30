dex = next(
    item for item in info.perp_dexs()
    if isinstance(item, dict) and item.get("name") == "zqjx"
)

metadata, contexts = info.post(
    "/info",
    {"type": "metaAndAssetCtxs", "dex": "zqjx"},
)
market_index = next(
    index for index, item in enumerate(metadata["universe"])
    if item["name"] == "zqjx:DEMO"
)

verified = {
    "dex": dex,
    "metadata": metadata["universe"][market_index],
    "context": contexts[market_index],
    "limits": info.post(
        "/info",
        {"type": "perpDexLimits", "dex": "zqjx"},
    ),
}

print(json.dumps(verified, indent=2))
