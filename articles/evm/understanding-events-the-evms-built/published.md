# Published examples

Source: https://andreyobruchkov1996.substack.com/p/understanding-events-the-evms-built

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `a495df46e9b937256c956665661a4b327d792b2757cb47d4ed71d7f9d232230a`

````text
event Transfer(address indexed from, address indexed to, uint256 value);
````

## Block 2

SHA-256: `f379dabcea5bcf9150c31c41c981a302ffa9843d88c0ca07c4cb09008ac56b70`

````text
curl -s -X POST https://polygon-amoy-bor-rpc.publicnode.com \
  -H “Content-Type: application/json” \
  --data ‘{
    “jsonrpc”:”2.0”,
    “method”:”eth_getLogs”,
    “params”:[{
      “fromBlock”:”0x182e86c”,
      “toBlock”:”0x182e86c”,
      “address”:”0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904”,
      “topics”:[
        “0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef”,
        “0x0000000000000000000000007f8b1ca29f95274e06367b60fc4a539e4910fd0c”
      ]
    }],
    “id”:1
  }’ | jq
````

## Block 3

SHA-256: `a461de78459511f5f6478947ad51451251fa1abe47518a811cbbae3c187f504d`

````text
{
  “jsonrpc”: “2.0”,
  “id”: 1,
  “result”: [
    {
      “address”: “0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904”,
      “topics”: [
        “0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef”,
        “0x0000000000000000000000007f8b1ca29f95274e06367b60fc4a539e4910fd0c”,
        “0x0000000000000000000000002a51ae0ad42dc7d2eb89462a7d41e79502bcf697”
      ],
      “data”: “0x0000000000000000000000000000000000000000000000000de0b6b3a7640000”,
      “blockNumber”: “0x182e86c”,
      “transactionHash”: “0x330e48c4c3adcc17b0819b7bf7344bb5010beee59551713231e977508ee1b236”,
      “transactionIndex”: “0x2”,
      “blockHash”: “0xb48487df956cb9fd6cc9750e2438b03c99d146910a2a1159850712c38ee85681”,
      “logIndex”: “0x3”,
      “removed”: false
    }
  ]
}
````
