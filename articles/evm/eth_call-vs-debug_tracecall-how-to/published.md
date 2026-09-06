# Published examples

Source: https://andreyobruchkov1996.substack.com/p/eth_call-vs-debug_tracecall-how-to

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `e79590d539e5efdf9a2da96a9dffcc76968ef8cecb65b93d2e61c2eb6c62fd48`

````text
eth_call(params, blockNumber)
````

## Block 2

SHA-256: `2ec1997fc022c12df1afdce878111a663107f07e7adcc0b0c96cb3ff34412b91`

````text
{
  “to”: “0xTargetContract”,
  “from”: “0xOptionalCaller”,
  “data”: “0xCalldata”,
  “value”: “0x...”,                 // optional; affects opcodes/balances during simulation
  “gas”: “0x...”,                   // sometimes optional; cap for the sim
  “maxFeePerGas”: “0x...”,          // sometimes optional; affects BASEFEE/GASPRICE reads
  “maxPriorityFeePerGas”: “0x...”,  // optional
  “gasPrice”: “0x...”               // legacy; affects GASPRICE if EIP-1559 fields absent
}
````

## Block 3

SHA-256: `8e4fa9d9a638a9253c8f1d6b12c01f422838d1a05482701928a2fe0b49c81740`

````text
{
  “method”: “eth_call”,
  “params”: [
    {
      “from”:  “0xAAAaaaaAAAAaaaaAAAaaaaaAAAAAaaaaaAAAAaaA”,
      “to”:    “0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE”,
      “value”: “0x..”, // hex integer that represents value 
      “data”:  “0x...”
    },
    “0x12D687F”  // block number
  ],
  “id”: 1,
  “jsonrpc”: “2.0”
}
````

## Block 4

SHA-256: `a13ca67e8c1bbfb8c96b593d8fc349f6b679598e4402b0afe3eb31d55ef5ec05`

````text
curl -X POST <your-node-url> \
     -H “Content-Type: application/json” \
     -d ‘{
  “jsonrpc”: “2.0”,
  “method”: “eth_call”,
  “params”: [
    {
      “from”: “0x...”,
      “to”: “0x...”, 
      “value”: “0x1”,
      “data”: “0x...”
    },
    “latest”
  ],
````

## Block 5

SHA-256: `e9f3e9ccc737b25aeed61311bfc655cf6d1050aaa26659f8a4e169af49eba913`

````text
debug_traceCall(params, blockNumber, config:(optional))
````

## Block 6

SHA-256: `6dd0205b36ba39e62eca5998f6a52760973d4fa0d61723d4c1725f19ed201b92`

````text
{
  “method”: “debug_traceCall”,
  “params”: [
    { “to”: “0x...”, “data”: “0x...” },
    “latest”,
    { “tracer”: “callTracer”, “timeout”: “30s” }
  ],
  “id”: 2, “jsonrpc”: “2.0”
}
````

## Block 7

SHA-256: `69d2c4bbde842c747ec2c5cc19c47e37fe0e93a2360422e586ca922e108c2cba`

````text
curl <you-node-rpc-url> \
-X POST \
-H “Content-Type: application/json” \
--data ‘{”method”:”debug_traceCall”,”params”:[{”from”:”0x...”,”to”:”0x...”,”data”:”0x...”}, “latest”, {”tracer”: “callTracer”, “timeout”: “30s”}],”id”:1,”jsonrpc”:”2.0”}’
````
