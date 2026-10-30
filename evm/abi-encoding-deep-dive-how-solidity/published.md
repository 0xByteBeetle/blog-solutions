# Published examples

Source: https://andreyobruchkov1996.substack.com/p/abi-encoding-deep-dive-how-solidity

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `c192ab06f48afa175e6404db2955c78925174b178984f6f4722016bf10d10377`

````text
pragma solidity 0.8.12;

contract Storage {
    struct my_storage_struct {
        uint256 number;
        string owner;
    }
    my_storage_struct my_storage;

    function store(my_storage_struct calldata new_storage) public {
        my_storage = new_storage;
    }
    function retrieve() public view returns (my_storage_struct memory){
        return my_storage;
    }
}
````

## Block 2

SHA-256: `72857717ecf1422012857932b05558e8420f6ebaec414f8eed43d8a7726e9a56`

````text
[
 {
  “inputs”: [
   {
    “components”: [
     {
      “internalType”: “uint256”,
      “name”: “number”,
      “type”: “uint256”
     },
     {
      “internalType”: “string”,
      “name”: “owner”,
      “type”: “string”
     }
    ],
    “internalType”: “struct Storage.my_storage_struct”,
    “name”: “new_storage”,
    “type”: “tuple”
   }
  ],
  “name”: “store”,
  “outputs”: [],
  “stateMutability”: “nonpayable”,
  “type”: “function”
 },
 {
  “inputs”: [],
  “name”: “retrieve”,
  “outputs”: [
   {
    “components”: [
     {
      “internalType”: “uint256”,
      “name”: “number”,
      “type”: “uint256”
     },
     {
      “internalType”: “string”,
      “name”: “owner”,
      “type”: “string”
     }
    ],
    “internalType”: “struct Storage.my_storage_struct”,
    “name”: “”,
    “type”: “tuple”
   }
  ],
  “stateMutability”: “view”,
  “type”: “function”
 }
]
````

## Block 3

SHA-256: `bc046549abff507247c8f85b0ff1f9d9b5a6c4696b017bbf3e8622d14ece6960`

````text
keccak256(”store((uint256,string))”) = 0xddd456b3
````

## Block 4

SHA-256: `031f24b2fffa736004fe15a6a0b4b9f8d19d4570e475d39288f4980674ab419c`

````text
0xddd356b3
0000000000000000000000000000000000000000000000000000000000000020
00000000000000000000000000000000000000000000000000000000075bcd15
0000000000000000000000000000000000000000000000000000000000000040
0000000000000000000000000000000000000000000000000000000000000003
626f620000000000000000000000000000000000000000000000000000000000
````

## Block 5

SHA-256: `8c3d116acc47a86b7f502e7cbb2f80582dbf9eaf07bfd175f8498d5f412c614a`

````text
(uint256 number, string memory owner) = abi.decode(returnData, (uint256, string));

// you will get
number = 123456789
owner = “bob”
````
