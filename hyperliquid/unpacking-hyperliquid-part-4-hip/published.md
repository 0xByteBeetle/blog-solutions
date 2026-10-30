# Published examples

Source: https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-4-hip

Captured 2026-10-30T15:07:52.121Z from the live rendered article. Native code/command/output blocks are preserved exactly, including whitespace; full article prose and images are not copied here. Outputs are historical observations, not live fixtures. Commands may target public networks; do not execute blindly.

## Block 1

SHA-256: `22faed90347bcc98daa48762037e77dffad5e601a0441a5efce034ce036d3085`

````text
satisfy the current stake requirement
→ inspect the deployment auction
→ submit registerAsset2 with the DEX schema and initial asset
→ verify the DEX namespace and market metadata
→ configure margin, funding, fees, and open-interest controls
→ maintain oracle and mark inputs
→ monitor deposits, limits, and market state
→ halt and settle the market when required
````

## Block 2

SHA-256: `20f30a2578780bbe3d51c660af5600c782507fb02f30320e38859ddf4c03ad0e`

````text
type PerpDeployAction =
  | { type: "perpDeploy"; registerAsset2: RegisterAsset2 }
  | { type: "perpDeploy"; setOracle: SetOracle }
  | { type: "perpDeploy"; haltTrading: HaltTrading }
  // Margin, funding, fees, limits, annotations, permissions, and other
  // operator actions are documented in the official current reference.
````

## Block 3

SHA-256: `1e6c3ef48ae7367eb24f57c39d2b9af4de6410c0c83605da744d7e9bee5b64f4`

````text
type RegisterAsset2 = {
  maxGas?: number
  assetRequest: {
    coin: string
    szDecimals: number
    oraclePx: string
    marginTableId: number
    marginMode: "strictIsolated" | "noCross" | "normal"
  }
  dex: string
  schema?: {
    fullName: string
    collateralToken: number
    oracleUpdater?: string
  }
}
````

## Block 4

SHA-256: `2d5492016e023c2dfc19a8de08034c45389e0ca2861f49900973332f8cd57006`

````text
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

````

## Block 5

SHA-256: `e6320524201e76766cf850b1633cbe3f49bb4d3d844599b01a82b8c0dc2e1d77`

````text
asset = 100000 + perpDexIndex × 10000 + indexInMeta
      = 100000 + 1 × 10000 + 0
      = 110000
````

## Block 6

SHA-256: `9511b58726241c1f5dcdacf505454a58dcab8a1200dfa1dc6d4f98dfa510bb93`

````text
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

````

## Block 7

SHA-256: `4f64c26bc65de1a79886be7a365d030598c1afaad3596072d24cd8c3a3ec418c`

````text
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

````

## Block 8

SHA-256: `e73aedd6d8255fe9c7bc93dcf82e3b3911bb618cc27eb267998c593ef2215042`

````text
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

````

## Block 9

SHA-256: `98dc690e6e98b6096ebfdce23fd219664b449e9b083f8fa338d14447270ff6ee`

````text
expected = f"DEPLOY {coin}"
typed = input(f"Type '{expected}' to submit this TESTNET action: ")
if typed != expected:
    raise RuntimeError("submission cancelled")

nonce = get_timestamp_ms()
signature = sign_l1_action(
    wallet,
    action,
    None,
    nonce,
    None,
    False,  # is_mainnet=False selects the testnet signing domain
)

response = API(TESTNET_API_URL).post(
    "/exchange",
    {
        "action": action,
        "nonce": nonce,
        "signature": signature,
        "vaultAddress": None,
        "expiresAfter": None,
    },
)

print(json.dumps(response, indent=2))

````

## Block 10

SHA-256: `4a629e732752ef9a85117a3069be5ef6a9b95749f5e427317ec6a4368698c9b6`

````text
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

````

## Block 11

SHA-256: `d5c24d932e999831dab09e29a1f7ab557222ca07dbc92ef69b0be26ce98d5011`

````text
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
````

## Block 12

SHA-256: `97c3573c2fd32a446f3ea4c5a4a6e295bbbe5d5c25db5b6bb120dbe13847ddeb`

````text
curl -s https://api.hyperliquid.xyz/info \
  -H 'Content-Type: application/json' \
  -d '{"type":"perpDexs"}' | jq
````

## Block 13

SHA-256: `9d059c1f449745ffcfb90410f9786335713fd572fccde9ab4c0aec4a6afee34a`

````text
{
  "name": "para",
  "fullName": "Paragon",
  "deployer": "0x8888888c43cbb7e1c4132542e46831bffd866ed3",
  "oracleUpdater": "0x8888888c43cbb7e1c4132542e46831bffd866ed3",
  "feeRecipient": "0x1770f43c71b8b2977771b73ca4c4cbe0c20412ed"
}
````

## Block 14

SHA-256: `6a822469344621ad642c0a3b4abfa9fcebc1f5958628c930a74ee9a791cf9df7`

````text
curl -s https://api.hyperliquid.xyz/info \
  -H 'Content-Type: application/json' \
  -d '{"type":"metaAndAssetCtxs","dex":"para"}' | jq
````

## Block 15

SHA-256: `bc7848a57d5def502cab4a37db1892ec5c610a7bcc429171b89cacb468bc0072`

````text
{
  "szDecimals": 2,
  "name": "para:CRDO",
  "maxLeverage": 10,
  "marginTableId": 10,
  "onlyIsolated": true,
  "marginMode": "strictIsolated",
  "growthMode": "enabled"
}
````

## Block 16

SHA-256: `bf73f7459c9bd567aaa2afe893ad4ceab94b5f2c6c624cea9a8f595d97e201c8`

````text
{
  "funding": "0.0000440215",
  "openInterest": "1083.1",
  "dayNtlVlm": "367656.8567",
  "oraclePx": "230.6393",
  "markPx": "230.8112",
  "midPx": "230.835",
  "impactPxs": ["230.46", "231.21"]
}
````

## Block 17

SHA-256: `15b4f5de0a35a98f1dad5b72e7468174c710cebbd5a4b7cfe4259f7a17555d9b`

````text
curl -s https://api.hyperliquid.xyz/info \
  -H 'Content-Type: application/json' \
  -d '{"type":"perpDexLimits","dex":"para"}' | jq
````

## Block 18

SHA-256: `0367367989d07f40114a292249c082e0d73060958ce132198019083b9aa3cdce`

````text
Deployer configuration
→ asset metadata
→ continuous market context
→ DEX and asset limits
→ trader-visible HyperCore state
````

## Block 19

SHA-256: `75959ce34f59bb2f9d3138a4b391034a4b4aed25aa73502428bad17613bbb7c2`

````text
type SetOracle = {
  dex: string
  oraclePxs: Array<[string, string]>
  markPxs: Array<Array<[string, string]>>
  externalPerpPxs: Array<[string, string]>
}
````

## Block 20

SHA-256: `2153ccfe4fa30c895899c013772531216eecdfb9d92e0b6783320485e5df7a86`

````text
oracle_pxs = {
    "demo:ASSET": "100.12",
}

mark_pxs = [{
    "demo:ASSET": "100.10",
}]

external_perp_pxs = {
    "demo:ASSET": "100.11",
}

result = exchange.perp_deploy_set_oracle(
    "demo",
    oracle_pxs,
    mark_pxs,
    external_perp_pxs,
)
````

## Block 21

SHA-256: `3803d26a7dfc9d295566e0d315199ef788e5882425c46885c8232d0b72170d71`

````text
premium = 0.5 × (impactBidPx + impactAskPx) / oraclePx - 1
````

## Block 22

SHA-256: `d897f1dec07e4c47d4faadc6b27a99a1390662881d08b6203215b863275baf89`

````text
funding payment = position size × oracle price × funding rate
````

## Block 23

SHA-256: `b48ee9f8b8d93e893638c050e23ca18d25ab0b01e05fcae65cffc92656a9278b`

````text
{dex}:{coin}
````

## Block 24

SHA-256: `fdc6e90182b93aa1f1729a278daa65c1f31963e351332ad22e34fc16e4b41ffd`

````text
asset = 100000 + perpDexIndex × 10000 + indexInMeta
````

## Block 25

SHA-256: `7cedf8363a6075c471029419c3d59e5ba296c615cf41477ec179221ce7b7cb9a`

````text
100000 + 1 × 10000 + 0 = 110000
````

## Block 26

SHA-256: `f105a51d893e022f5e32417989cbe55fc875399ff88f5c33a4fcefda738c3c9a`

````text
Trader signs a normal order action
→ asset ID selects the HIP-3 DEX and market
→ HyperCore validates margin and limits
→ the DEX order book matches the order
→ HyperCore updates positions, balances, and funding state
````
