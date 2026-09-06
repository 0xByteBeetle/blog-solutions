# Published examples

Source: https://andreyobruchkov1996.substack.com/p/ethereum-node-types-explained-and-why-they-can-make-or-break-your-debugging-fc8d89b724cc

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `e79590d539e5efdf9a2da96a9dffcc76968ef8cecb65b93d2e61c2eb6c62fd48`

````text
eth_call(params, blockNumber)
````

## Block 2

SHA-256: `591ff0a67fb1711455492ebdd3f4873f57baa23dc58e5b90aeafbc33698966ea`

````text
{
  "to": "0xTargetContract",
  "from": "0xOptionalCaller",
  "data": "0xCalldata",
  "value": "0x...",                 // optional; affects opcodes/balances during simulation
  "gas": "0x...",                   // sometimes optional; cap for the sim
  "maxFeePerGas": "0x...",          // sometimes optional; affects BASEFEE/GASPRICE reads
  "maxPriorityFeePerGas": "0x...",  // optional
  "gasPrice": "0x..."               // legacy; affects GASPRICE if EIP-1559 fields absent
}
````

## Block 3

SHA-256: `253058f2862eef93d75824927ecc66c4e7359a008f38264d7c85fc359e8d35c8`

````text
{
  "method": "eth_call",
  "params": [
    {
      "from":  "0xAAAaaaaAAAAaaaaAAAaaaaaAAAAAaaaaaAAAAaaA",
      "to":    "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      "value": "0x..", // hex integer that represents value 
      "data":  "0x..."
    },
    "0x12D687F"  // block number
  ],
  "id": 1,
  "jsonrpc": "2.0"
}
````

## Block 4

SHA-256: `d01d02dd128160091eae91ec39cd0e9e3bd127a939daf87f6106f8a087bd1b2a`

````text
curl -X POST <your-node-url> \
     -H "Content-Type: application/json" \
     -d '{
  "jsonrpc": "2.0",
  "method": "eth_call",
  "params": [
    {
      "from": "0x...",
      "to": "0x...", 
      "value": "0x1",
      "data": "0x..."
    },
    "latest"
  ],
````

## Block 5

SHA-256: `e9f3e9ccc737b25aeed61311bfc655cf6d1050aaa26659f8a4e169af49eba913`

````text
debug_traceCall(params, blockNumber, config:(optional))
````

## Block 6

SHA-256: `f5e23da252ba518002cb6611281cbd99c5bca28c7f421f1a808b5933cd6065ac`

````text
{
  "method": "debug_traceCall",
  "params": [
    { "to": "0x...", "data": "0x..." },
    "latest",
    { "tracer": "callTracer", "timeout": "30s" }
  ],
  "id": 2, "jsonrpc": "2.0"
}
````

## Block 7

SHA-256: `5b70ab4c19dd8651d48d90a8080ab10eb7bd148a97d0abfb8f5df316b332811a`

````text
curl <you-node-rpc-url> \
-X POST \
-H "Content-Type: application/json" \
--data '{"method":"debug_traceCall","params":[{"from":"0x...","to":"0x...","data":"0x..."}, "latest", {"tracer": "callTracer", "timeout": "30s"}],"id":1,"jsonrpc":"2.0"}'
````
