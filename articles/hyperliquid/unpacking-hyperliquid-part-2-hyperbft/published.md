# Published examples

Source: https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-2-hyperbft

Captured 2026-10-30T15:05:57.527Z from the live rendered article. Native code/command/output blocks are preserved exactly, including whitespace; full article prose and images are not copied here. Outputs are historical observations, not live fixtures. Commands may target public networks; do not execute blindly.

## Block 1

SHA-256: `5364eb4e3da81f065df56b1204bbc5fa1108955ed85f77dd57e973e9e9239e71`

````text
curl -X POST https://api.hyperliquid-testnet.xyz/info \
     -H "Content-Type: application/json" \
     -d '{"type": "clearinghouseState", "user": "0x09174CC31425746672737a0c3d06Fb27E82274e8"}' | jq
````

## Block 2

SHA-256: `0ac8de0cad8113de6a7ec0acdba814ea4ceddb804fe460384bd4512b8407613d`

````text
{
  "marginSummary": {
    "accountValue": "0.0",
    "totalNtlPos": "0.0",
    "totalRawUsd": "0.0",
    "totalMarginUsed": "0.0"
  },
  "crossMarginSummary": {
    "accountValue": "0.0",
    "totalNtlPos": "0.0",
    "totalRawUsd": "0.0",
    "totalMarginUsed": "0.0"
  },
  "crossMaintenanceMarginUsed": "0.0",
  "withdrawable": "0.0",
  "assetPositions": [],
  "time": 1776982271519
}
````

## Block 3

SHA-256: `0f0c1fe053ddbee054fc6510925b1e7b4bc87eea6ab76601369e748d5c49aebd`

````text
curl -X POST https://api.hyperliquid-testnet.xyz/info \
     -H "Content-Type: application/json" \
     -d '{"type": "spotClearinghouseState", "user": "0x09174CC31425746672737a0c3d06Fb27E82274e8"}' | jq
````

## Block 4

SHA-256: `1265f4d8da0671b5a0ad4a098eb3197a130fc17ca408f7031613c765bc518f08`

````text
{
  "balances": [
    {
      "coin": "USDC",
      "token": 0,
      "total": "798.0",
      "hold": "0.0",
      "entryNtl": "0.0"
    },
    {
      "coin": "TZERO",
      "token": 1204,
      "total": "0.0",
      "hold": "0.0",
      "entryNtl": "0.0"
    },
    {
      "coin": "UETH",
      "token": 1242,
      "total": "0.006404022",
      "hold": "0.0",
      "entryNtl": "2.67278865"
    },
    ...
  ],
  "tokenToAvailableAfterMaintenance": [
    [
      0,
      "798.0"
    ]
  ]
}

````
