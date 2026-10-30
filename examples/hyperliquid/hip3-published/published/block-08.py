private_key = os.environ["HIP3_TESTNET_PRIVATE_KEY"]
wallet = Account.from_key(private_key)

dex = "zqjx"
coin = f"{dex}:DEMO"
max_gas_hype = Decimal("500")
max_gas_wei = int(max_gas_hype * Decimal("100000000"))

info = Info(TESTNET_API_URL, skip_ws=True)

if any(
    isinstance(item, dict) and item.get("name") == dex
    for item in info.perp_dexs()
):
    raise RuntimeError(f"DEX '{dex}' already exists")

auction = info.query_perp_deploy_auction_status()
if Decimal(auction["currentGas"]) > max_gas_hype:
    raise RuntimeError("current auction gas exceeds the configured cap")

collateral = next(
    token for token in info.spot_meta()["tokens"]
    if token["index"] == 0
)

action = {
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
            "collateralToken": collateral["index"],
            "oracleUpdater": wallet.address.lower(),
        },
    },
}

print(json.dumps({
    "mode": "DRY_RUN",
    "network": "testnet",
    "wallet": wallet.address,
    "auction": auction,
    "collateral": collateral,
    "action": action,
    "submitted": False,
}, indent=2))
