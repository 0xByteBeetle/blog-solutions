# Published examples

Source: https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-3-hyperevm

Captured 2026-10-30T15:06:34.178Z from the live rendered article. Native code/command/output blocks are preserved exactly, including whitespace; full article prose and images are not copied here. Outputs are historical observations, not live fixtures. Commands may target public networks; do not execute blindly.

## Block 1

SHA-256: `10631c234342311755395a7f9eb3c6a29c6b5cbb5d0feb68cbbcda893641e2d6`

````text
0x0000000000000000000000000000000000000800  position
0x0000000000000000000000000000000000000801  spotBalance
0x0000000000000000000000000000000000000802  userVaultEquity
0x0000000000000000000000000000000000000803  withdrawable
0x0000000000000000000000000000000000000806  markPx
0x0000000000000000000000000000000000000807  oraclePx
0x0000000000000000000000000000000000000808  spotPx
0x0000000000000000000000000000000000000809  l1BlockNumber
0x000000000000000000000000000000000000080a  perpAssetInfo
0x000000000000000000000000000000000000080b  spotInfo
0x000000000000000000000000000000000000080c  tokenInfo
0x000000000000000000000000000000000000080e  bbo
0x000000000000000000000000000000000000080f  accountMarginSummary
0x0000000000000000000000000000000000000810  coreUserExists
````

## Block 2

SHA-256: `8e75f3496cbf8fe6fc9c97b26ab96ac19a50dec437367716275c233e72529196`

````text
interface WrongOracle {
    function oraclePx(uint32 index) external view returns (uint64);
}
````

## Block 3

SHA-256: `d9756e1508ab958efd4c60d5df5291e46dd9f162a8202395455863a9cd69e094`

````text
library HyperCoreRead {
    address constant ORACLE_PX = 0x0000000000000000000000000000000000000807;

    function oraclePx(uint32 index) internal view returns (uint64) {
        (bool ok, bytes memory out) = ORACLE_PX.staticcall(abi.encode(index));

        require(ok, "oraclePx precompile failed");
        return abi.decode(out, (uint64));
    }
}
````

## Block 4

SHA-256: `529bc609b4564021d5318a164ed2d64264de746e4136ea55fe5164a0b34708c7`

````text
curl -s -X POST https://rpc.hyperliquid-testnet.xyz/evm \
  -H "Content-Type: application/json" \
  --data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "eth_call",
    "params": [
      {
        "to": "0x0000000000000000000000000000000000000807",
        "data": "0x0000000000000000000000000000000000000000000000000000000000000003"
      },
      "latest"
    ]
  }'
````

## Block 5

SHA-256: `3e7f25ed9b3bcbc71e676e5733ed4cd2a2efe635b9ff75a45e374181262a9db7`

````text
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x000000000000000000000000000000000000000000000000000000000009a255"
}
````

## Block 6

SHA-256: `dc703884c0e867a25e3944a4c673c78a39f231071ddee1cf73ad96496c5fb390`

````text
{
  "name": "BTC",
  "szDecimals": 5,
  "maxLeverage": 40,
  "marginTableId": 54
}
````

## Block 7

SHA-256: `a812ad85f967a1fe9640de3f813c56652dd8bfd2209216b994dee95866ead1c5`

````text
curl -s -X POST https://api.hyperliquid-testnet.xyz/info \
-H "Content-Type: application/json" \
--data '{"type":"meta"}'
````

## Block 8

SHA-256: `f9cc545577b9fcad0d2e620f9bab82365591dac5881c524b5150f618485ddaea`

````text
struct Bbo {
    uint64 bid;
    uint64 ask;
}
````

## Block 9

SHA-256: `ffc3ec65a0f90afbdd47aa35ee8f90f79e1ba9a15a2c20fb2de4674aa9589e35`

````text

curl -s -X POST https://rpc.hyperliquid-testnet.xyz/evm \
  -H "Content-Type: application/json" \
  --data '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "eth_call",
    "params": [
      {
        "to": "0x000000000000000000000000000000000000080e",
        "data": "0x0000000000000000000000000000000000000000000000000000000000000003"
      },
      "latest"
    ]
  }'
````

## Block 10

SHA-256: `96adca67facd3cec4efb37db73fc0c58f5b4ef5c1161648672b7213a864d7b26`

````text
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x000000000000000000000000000000000000000000000000000000000009a33a000000000000000000000000000000000000000000000000000000000009a42a"
}
````

## Block 11

SHA-256: `ffde40746ad69ad94e3fcee6257a16e91f6c6bd55746efc2c768e23f4b268372`

````text
bid raw = 0x9a33a = 631610
ask raw = 0x9a42a = 631850
````

## Block 12

SHA-256: `e21dbb624488bdca732467d5b7d53a2d6b90dea729d1bb1819be56692c4f1919`

````text
bid = 631610 / 10 = 63161.0
ask = 631850 / 10 = 63185.0
````

## Block 13

SHA-256: `c009b25fba79c4bc17ee8534d0904f33fb2edecda916811638a48980c1782d60`

````text
library HyperCoreBbo {
    address constant BBO = 0x000000000000000000000000000000000000080e;

    struct Bbo {
        uint64 bid;
        uint64 ask;
    }

    function bbo(uint32 asset) internal view returns (Bbo memory) {
        (bool ok, bytes memory out) = BBO.staticcall(abi.encode(asset));

        require(ok, "bbo precompile failed");
        return abi.decode(out, (Bbo));
    }
}
````

## Block 14

SHA-256: `098a6987328be3cdae656dcc10339328ab1e6d14a56c52bb6b99b019d2e34ac2`

````text
struct SpotBalance {
    uint64 total;
    uint64 hold;
    uint64 entryNtl;
}
````

## Block 15

SHA-256: `12e0153d0f19731de858fc11d8a555aaccd4cb3a2a35887204035f037b9b78cf`

````text
library HyperCoreBalances {
    address constant SPOT_BALANCE = 0x0000000000000000000000000000000000000801;

    struct SpotBalance {
        uint64 total;
        uint64 hold;
        uint64 entryNtl;
    }

    function spotBalance(address user, uint64 token ) internal view returns (SpotBalance memory) {
        (bool ok, bytes memory out) = SPOT_BALANCE.staticcall(abi.encode(user, token));

        require(ok, "spotBalance precompile failed");
        return abi.decode(out, (SpotBalance));
    }
}
````

## Block 16

SHA-256: `6bbd24c3e1224996ae219d7f5ae9661d2a4e296c2656d0a03e050405578b9349`

````text
struct Position {
    int64 szi;
    uint64 entryNtl;
    int64 isolatedRawUsd;
    uint32 leverage;
    bool isIsolated;
}
````

## Block 17

SHA-256: `86f47bb77b4acdd43311d9acc41203bab0c87498940ae2921db22a36968a47ab`

````text
szi > 0  long
szi < 0  short
szi = 0  no position
````

## Block 18

SHA-256: `48b48bd0c036f1f74adf77ab9e0b5b299ff504ea95fac895cdb5cae4c4deac89`

````text
struct AccountMarginSummary {
    int64 accountValue;
    uint64 marginUsed;
    uint64 ntlPos;
    int64 rawUsd;
}
````

## Block 19

SHA-256: `e221be7eea9856f6676635f3579b2c74fa3c0404a335d91b1c26f4db5a504d66`

````text
interface ICoreWriter {
    function sendRawAction(bytes calldata data) external;
}
````

## Block 20

SHA-256: `8a2780b5ff9c3b602ba5e5127b8097bb4a233473e60940c0fc994c4a3ad24097`

````text
byte 0      encoding version
bytes 1-3   action id, big-endian
bytes 4+    raw ABI-encoded action fields
````

## Block 21

SHA-256: `2a9e41c79c8d65f5a134d3008bb7cafeab983fb284bc34a902409e74b416a6f1`

````text
data[0] = 0x01        // version 1
data[1] = 0x00
data[2] = 0x00
data[3] = actionId
data[4..] = abi.encode(...)
````

## Block 22

SHA-256: `b4f70f5aab6b08ab6f5ebab15eefe708e533e8e75e1df256940a1a3e04fa4236`

````text
interface ICoreWriter {
    function sendRawAction(bytes calldata data) external;
}

contract UsdClassTransfer {
    address constant CORE_WRITER = 0x3333333333333333333333333333333333333333;

    function transferUsdClass(uint64 ntl, bool toPerp) external {
        bytes memory payload = abi.encode(ntl, toPerp);
        bytes memory data = bytes.concat(hex"01000007", payload);

        ICoreWriter(CORE_WRITER).sendRawAction(data);
    }
}
````

## Block 23

SHA-256: `764e9a2d17829ea59083d56db1fb6d702d5e97099b5c705a0c5bbfe0774b02e0`

````text
(
  uint32 asset,
  bool isBuy,
  uint64 limitPx,
  uint64 sz,
  bool reduceOnly,
  uint8 encodedTif,
  uint128 cloid
)
````

## Block 24

SHA-256: `29e779158d491b7cd196397c3677981d585fc88c4a040b30dc334f91558c7cf6`

````text
contract HyperCoreLimitOrder {
    address constant CORE_WRITER = 0x3333333333333333333333333333333333333333;

    uint8 constant TIF_ALO = 1;
    uint8 constant TIF_GTC = 2;
    uint8 constant TIF_IOC = 3;

    function placeLimitOrder(uint32 asset,bool isBuy,uint64 limitPx,uint64 sz,bool reduceOnly,uint8 tif,uint128 cloid) external {
        bytes memory payload = abi.encode(asset,isBuy,limitPx,sz,reduceOnly,tif,cloid);

        bytes memory data = bytes.concat(hex"01000001", payload);

        ICoreWriter(CORE_WRITER).sendRawAction(data);
    }
}
````

## Block 25

SHA-256: `8bc34d30b773cbf4b27569d1f9b10095b70d7de7f470b742d2b9a232c06b691f`

````text
call A
call B
state from A is visible to B
````

## Block 26

SHA-256: `fe87fe6316de9ede8e73991985b22e95c4b6208df5d7a858cfe121f15865a591`

````text
1. EVM execution emits intent
2. HyperCore later validates intent
3. HyperCore mutates native financial state
````

## Block 27

SHA-256: `ce6e7797e1c410d272bfa26a761e4da626417772e630aa95c57ff95abf6f2eb2`

````text
function normalizePerpPrice(uint64 raw,uint8 szDecimals) internal pure returns (uint256) {
    uint8 divisorDecimals = 6 - szDecimals;
    return uint256(raw) * 1e18 / (10 ** divisorDecimals);
}
````
