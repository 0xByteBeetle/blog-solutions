# Published examples

Source: https://andreyobruchkov1996.substack.com/p/deployments-and-deterministic-addresses

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `f4a7e041f8d20a0176b6c16c79aefe9146f87b475be8339b8d8203f13fbbf3bc`

````text
address = keccak256(rlp(sender_address, sender_nonce))[12:]
````

## Block 2

SHA-256: `50bc66d8aae5ae9020e15d53a103ddf91de202b3af5aeb3fd124b6861cdd2405`

````text
anvil
````

## Block 3

SHA-256: `c8152b84a2e2c4b49db74921144f21d3b9ffc27e110e7e951df93aca8712d749`

````text
cast nonce <YOUR-ADDRESS> --rpc-url http://localhost:8545
````

## Block 4

SHA-256: `93b17e49936e02fd6bf9c08b5fabfa841436b8190e0dcc74cece1c70c99993e5`

````text
// <YOUR-ADDRESS> - can be address from anvil default addresses
cast compute-address <YOUR-ADDRESS> --nonce 1
Computed Address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
````

## Block 5

SHA-256: `5e9290913b79ae5caf0103b4688ac6ac5cd1aee520db5155736685c63b440a74`

````text
address = keccak256( 0xff ++ sender ++ salt ++ keccak256(init_code) )[12:]
````

## Block 6

SHA-256: `961199159debd57789401f8df93f7fc0473f5c955ebe97812be5a50d162f010c`

````text
pragma solidity ^0.8.12;

contract Storage {
    struct my_storage_struct {
        uint256 number;
        string owner;
    }
    my_storage_struct my_storage;

    function store(my_storage_struct calldata new_storage) public {
        if (new_storage.number > 100) {
            revert(”Number too large”);
        }
        my_storage = new_storage;
    }
    function retrieve() public view returns (my_storage_struct memory){
        return my_storage;
    }
}
````

## Block 7

SHA-256: `bf2c370d58fe8e9cefe8307cdcf96b360239095f9dcc38c58c66cff917ffe515`

````text
forge inspect Storage bytecode
````

## Block 8

SHA-256: `e5e381edef9558eeb48acef1c5bb5af5f4212439dab6a6b6a41ee453ebd75c77`

````text
cast keccak $(forge inspect Storage bytecode)
````

## Block 9

SHA-256: `94214bfba2070c5d9ea075d21df3fa3f8c8e16ef3f632564da4c288f3c7b6d07`

````text
0x9e7ceb5009cf19fc3a77cbead52c79f881b81800108a8931565aa92f9f1f5b64
````

## Block 10

SHA-256: `668ed055bbb8475e36015643b1f4a3dfc807223217470cf78b5ad4d9c19a483b`

````text
0x0000000000000000000000000000000000000000000000000000000000000042
````

## Block 11

SHA-256: `db2f0b4a8b6117e9dc391ab6f4095c54539c9f821eab85a7e8b221531198b5ba`

````text
// <YOUR-ADDRESS> - can be address from anvil default addresses
cast compute-address <YOUR-ADDRESS>\
  --salt 0x0000000000000000000000000000000000000000000000000000000000000042 \
  --init-code-hash 0x9e7ceb5009cf19fc3a77cbead52c79f881b81800108a8931565aa92f9f1f5b64

// Computed Address: 0x93eFaEdEe330e749D9AF79424398204EC04F89F1
````
