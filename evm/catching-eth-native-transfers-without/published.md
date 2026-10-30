# Published examples

Source: https://andreyobruchkov1996.substack.com/p/catching-eth-native-transfers-without

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `a4c2a8820741b88195c698526cd18f5401608a25164163a8e98b50b5200b4d4d`

````text
curl -s -X POST <YOUR-BLOCKCHAIN-NODE-URL>\
  -H “Content-Type: application/json” \
  --data ‘{
    “jsonrpc”:”2.0”,
    “id”:1,
    “method”:”trace_replayTransaction”,
    “params”:[
      “<tx-hash>”,
      [”trace”]
    ]
  }’ \
| jq -r ‘.result.trace[]
| select(.action.value!=”0x0”)
| {type, from:.action.from, to:.action.to, value:.action.value}’
````

## Block 2

SHA-256: `24edea3fe810b313cfb298bc0e544722bb3e70f2dd7b19e3b3e77bbdf49833b6`

````text
{
  “type”: “call”,
  “from”: “<addr1>”,
  “to”: “<addr2>”,
  “value”: “0x22e92f1cfbaaacd5d”
}
{
  “type”: “call”,
  “from”: “<addr3>”,
  “to”: “<addr4>”,
  “value”: “0x22e92f1cfbaaacd5d”
}
````

## Block 3

SHA-256: `aa9871ecfa25e1114e293cd548b233bd66d2b99830ad8f7f7f613e39c60f3a5f`

````text
function collectEthTransfers(node):
  if node.value > 0:
    record(from=node.from, to=node.to, value=node.value, type=node.type)
  for child in node.calls:
    collectEthTransfers(child)
````
