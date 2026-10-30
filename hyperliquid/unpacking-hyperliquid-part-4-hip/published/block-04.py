TESTNET_API_URL = "https://api.hyperliquid-testnet.xyz"
dex_name = "test"
coin = "test:ABC"

info = Info(TESTNET_API_URL, skip_ws=True)

# Find the DEX and preserve its index because the index is part of the
# HIP-3 action asset ID.
dex_entries = info.perp_dexs()
dex_index, dex = next(
    (index, item)
    for index, item in enumerate(dex_entries)
    if isinstance(item, dict) and item.get("name") == dex_name
)

metadata, contexts = info.post(
    "/info",
    {"type": "metaAndAssetCtxs", "dex": dex_name},
)
universe = metadata["universe"]
market_index = next(
    index for index, item in enumerate(universe)
    if item["name"] == coin
)

limits = info.post("/info", {"type": "perpDexLimits", "dex": dex_name})
status = info.post("/info", {"type": "perpDexStatus", "dex": dex_name})
annotation = info.post("/info", {"type": "perpAnnotation", "coin": coin})
auction = info.query_perp_deploy_auction_status()

action_asset_id = 100_000 + dex_index * 10_000 + market_index

snapshot = {
    "network": "testnet",
    "auction": auction,
    "dex": dex,
    "market": {
        "actionAssetId": action_asset_id,
        "metadata": universe[market_index],
        "context": contexts[market_index],
        "annotation": annotation,
    },
    "limits": limits,
    "status": status,
}

print(json.dumps(snapshot, indent=2))
