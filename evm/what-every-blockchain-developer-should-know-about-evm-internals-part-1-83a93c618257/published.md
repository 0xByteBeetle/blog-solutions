# Published examples

Source: https://andreyobruchkov1996.substack.com/p/what-every-blockchain-developer-should-know-about-evm-internals-part-1-83a93c618257

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `a4b41e9a95eb276943975a176f2703b0cd52f30248bdab8747cf1376223b3a39`

````text
function set(uint256 x)
````

## Block 2

SHA-256: `85bae15019c5b5a804626f1b372f429dc6e8d523819c62000bb952f8d0d99566`

````text
set(69420)
````

## Block 3

SHA-256: `50b65eb7b0cc89e539dda6d7a0f08d94c1db4909f689304da7b981e7329ebaf8`

````text
0x60fe47b1
0000000000000000000000000000000000000000000000000000000000010f2c
````

## Block 4

SHA-256: `680b2afa382afbf8532baff4339f790c6a75b05a3e7df2bb1ec233a03cebaca4`

````text
<4 bytes>    Function selector (first 4 bytes of keccak256)
<32 bytes>   Argument 1 (padded)
<32 bytes>   Argument 2 (padded)
...
````

## Block 5

SHA-256: `c73853d34192a238213da2fdb11c9f7471dcbf6e5c31ffd3ecc397cc513def81`

````text
cast calldata "set(uint256)" 69420
# Output:
# 0x60fe47b1000000000000000000000000000000000000000000000000000000010f2c
````

## Block 6

SHA-256: `ad3846d97aed7537ea3fd8d24b885a5bb948d0b074ef0d54d797ca36e63c4893`

````text
contract CalldataExample {
    string public storedName;

    function setName(string calldata _name) external {
        // _name is read-only and lives in calldata
        string memory tempName = _name;  // Copy to memory for manipulation if needed
        storedName = tempName;           // Save to persistent storage
    }
}
````

## Block 7

SHA-256: `d7e4b81175b335c1e8191b09ea7ee94d343af50765aa93aac84fc869273f382f`

````text
pragma solidity >=0.4.16 <0.9.0;

contract MiniExample {
    uint data;

    function set(uint x) public {
        data = x;
    }

    function get() public view returns (uint) {
        return data;
    }
}
````

## Block 8

SHA-256: `4b7b5348a64e84219aa4bd56d51a1818e0ca62eeb698809bfcfd5faa801d787b`

````text
6080604052348015600e575f5ffd5b506101298061001c5f395ff3fe6080604052348015600e575f5ffd5b50600436106030575f3560e01c806360fe47b11460345780636d4ce63c14604c575b5f5ffd5b604a60048036038101906046919060a9565b6066565b005b6052606f565b604051605d919060dc565b60405180910390f35b805f8190555050565b5f5f54905090565b5f5ffd5b5f819050919050565b608b81607b565b81146094575f5ffd5b50565b5f8135905060a3816084565b92915050565b5f6020828403121560bb5760ba6077565b5b5f60c6848285016097565b91505092915050565b60d681607b565b82525050565b5f60208201905060ed5f83018460cf565b9291505056fea2646970667358221220ec163686bf86159ebb242a8ca38f68fe4e9bf9be12def4ec8af94737310b0c6364736f6c634300081e0033
````

## Block 9

SHA-256: `60cf856210908ea469c6926cdd14d34c261836c741e83367883b40c3773d93e2`

````text
[00]    PUSH1   80 // Push 1-byte of value 80 on the stack
[02]    PUSH1   40 // Push 1-byte of value 40 on the stack
[04]    MSTORE   // Memory store
[05]    CALLVALUE   // Get deposited value from call
[06]    DUP1    
[07]    ISZERO  // A conditional opcode 
[08]    PUSH1   0xR // Push 2-bytes
[0b]    JUMPI   // Jump to another location on the stack
...
...
[138]
````

## Block 10

SHA-256: `5713f9d77c34fdb5aced085c94de515d9b21b277789ca8e64b448646a1f871cc`

````text
{
  "to": "0x8a19ba...",
  "from": "0xf9db21...",
  "value": "0x0",
  "gasPrice": 700000,
  "gasLimit": 210000,
  "data": "0x60fe47b10000000000000000000000000000000000000000000000000000000000010f2c"
}
````

## Block 11

SHA-256: `83a88e34958d36a109e1d4bee3907bf5b033848980f3771899ebab88f487fafa`

````text
0x60fe47b10000000000000000000000000000000000000000000000000000000000010f2c
````
