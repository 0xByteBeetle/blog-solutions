dex = "zqjx"
coin = "zqjx:DEMO"

oracle_action = {
    "type": "perpDeploy",
    "setOracle": {
        "dex": dex,
        "oraclePxs": sorted([(coin, "100.12")]),
        "markPxs": [sorted([(coin, "100.10")])],
        "externalPerpPxs": sorted([(coin, "100.11")]),
    },
}

print(json.dumps({
    "mode": "DRY_RUN",
    "network": "testnet",
    "iterations": 3,
    "intervalSeconds": 3.0,
    "action": oracle_action,
    "submitted": False,
}, indent=2))