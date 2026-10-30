dex = "demo"
coin = "demo:ASSET"
updater = "0x1111111111111111111111111111111111111111"

# HyperCore represents one HYPE as 100,000,000 native units.
max_gas_hype = Decimal("500")
max_gas_wei = int(max_gas_hype * Decimal("100000000"))

if max_gas_wei == 0:
    raise ValueError(
        "maxGas=0 consumes a reserve deployment at the current auction price"
    )

register_action = {
    "type": "perpDeploy",
    "registerAsset2": {
        "maxGas": max_gas_wei,
        "assetRequest": {
            "coin": coin,
            "szDecimals": 2,
            "oraclePx": "100.0",
            "marginTableId": 10,
            "marginMode": "strictIsolated",
        },
        "dex": dex,
        "schema": {
            "fullName": "Classroom Demo DEX",
            "collateralToken": 0,
            "oracleUpdater": updater.lower(),
        },
    },
}

oracle_action = {
    "type": "perpDeploy",
    "setOracle": {
        "dex": dex,
        "oraclePxs": sorted([(coin, "100.0")]),
        "markPxs": [sorted([(coin, "100.0")])],
        "externalPerpPxs": sorted([(coin, "100.0")]),
    },
}

print(json.dumps({
    "mode": "DRY_RUN",
    "submitted": False,
    "registerAction": register_action,
    "firstOracleAction": oracle_action,
}, indent=2))
