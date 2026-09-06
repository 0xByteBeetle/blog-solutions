# Published examples

Source: https://andreyobruchkov1996.substack.com/p/gas-matters-how-to-reduce-transaction-costs-in-your-solidity-code-0c0303d61a4f

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `5daffa57245b5b5856d2ab314c057e3b8d93ddd9f80b3bfb9c46a4fa29fc977d`

````text
# Constants (old → new values)
SLOAD_GAS              = 800        # was 200
SSTORE_SET_GAS         = 20000      # unchanged
SSTORE_RESET_GAS       = 5000       # unchanged
SSTORE_CLEARS_SCHEDULE = 15000      # unchanged
GAS_STIPEND            = 2300       # the 2 300-gas stipend for transfers

function performSSTORE(originalValue, currentValue, newValue):
    # 1. stipend check
    if gasleft() ≤ GAS_STIPEND:
        revert("out of gas")

    # 2. no-op store
    if currentValue == newValue:
        deductGas(SLOAD_GAS)
        return

    # 3. value actually changes
    if originalValue == currentValue:
        # 3.a first write in this TX
        if originalValue == 0:
            deductGas(SSTORE_SET_GAS)      # zero → non-zero
        else:
            deductGas(SSTORE_RESET_GAS)    # non-zero → different non-zero

        if newValue == 0:
            refund(SSTORE_CLEARS_SCHEDULE)  # track zero-clears

    else:
        # 3.b slot is “dirty” (already written in this TX)
        deductGas(SLOAD_GAS)

        if originalValue ≠ 0:
            if currentValue == 0:
                removeRefund(SSTORE_CLEARS_SCHEDULE)  # undo prior zero-clear
            if newValue == 0:
                refund(SSTORE_CLEARS_SCHEDULE)        # new zero-clear

        # 3.b.iii if we’ve reset back to original
        if originalValue == newValue:
            if originalValue == 0:
                refund(SSTORE_SET_GAS - SLOAD_GAS)
            else:
                refund(SSTORE_RESET_GAS - SLOAD_GAS)
````

## Block 2

SHA-256: `73e07db8232e3df833967bef4c3143c32bf0de779b145cdc66b6a702c774959c`

````text
C_mem(a) = G_memory·a + ⌊a² ÷ 512⌋
````

## Block 3

SHA-256: `7d73ec75414e9ad43a536d1ff54f9f25cb4a97d4ae7fdeb503a6e101719ede52`

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
            revert("Number too large");
        }
        my_storage = new_storage;
    }

    function retrieve() public view returns (my_storage_struct memory){
        return my_storage;
    }
}
````

## Block 4

SHA-256: `4de46069dad0c0dfdefd20639016cf4e87bf5820355a341b274088b64f86aeeb`

````text
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "forge-std/Test.sol";
import "../src/Storage.sol";

contract StorageTest is Test {
    Storage public storageContract;

    function setUp() public {
        storageContract = new Storage();
    }

    function testStoreStruct() public {
        Storage.my_storage_struct memory input = Storage.my_storage_struct({
            number: 25,
            owner: "bob"
        });

        storageContract.store(input);
    }
   
    function testStoreStructReverts() public {
        Storage.my_storage_struct memory input = Storage.my_storage_struct({
            number: 101,
            owner: "too much"
        });
        
        vm.expectRevert("Number too large"); 
        storageContract.store(input);
    }

}
````

## Block 5

SHA-256: `e8a531fa9c6cc869550f67d14cc1c6b06fc62c02cce0da6940a0f380826b74c7`

````text
forge test --gas-report
````

## Block 6

SHA-256: `50bc66d8aae5ae9020e15d53a103ddf91de202b3af5aeb3fd124b6861cdd2405`

````text
anvil
````

## Block 7

SHA-256: `af1dcb1aa4c60adbc01f20ec53e09cc01041824666a8e00ccc473ff6cb467285`

````text
forge create src/Storage.sol:Storage \
  --rpc-url http://localhost:8545 \
  --private-key <your-key> \
  --broadcast
````

## Block 8

SHA-256: `d89043ed0910d272d515939792692b2cf12efd692008b9a7cb79802a53087554`

````text
[⠊] Compiling...
No files changed, compilation skipped
Deployer: <your-address>
Deployed to: <deployed-contract-address>
Transaction hash: <tx-hash>
````

## Block 9

SHA-256: `040b9542575788578a924dfca7f5c6bf396102156088486eb2b22b93e815fa61`

````text
# encode function selector
export SIG=$(cast sig "store((uint256,string))")
# encode function arguments
export ARGS=$(cast abi-encode "store((uint256,string))" "(25,\"bob\")")
# build the calldata: encoded function_selector + encoded params
# (#0x removes the 0x from the $ARGS)
export CALLDATA="${SIG}${ARGS#0x}"

# output should be:
# 0xddd356b30000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001900000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000003626f620000000000000000000000000000000000000000000000000000000000

cast rpc eth_estimateGas \
  '{"from":"<your-address>","to":"contract-address","value":"0x0","data":"'"$CALLDATA"'"}' \
  'latest' \
  --rpc-url http://127.0.0.1:8545

# output shoud be:
# 0x10944 = 67908 // exactly the number we got previously in off-chain exampl
````

## Block 10

SHA-256: `ed4e8540e644f446f2bdd62e61a78a7989bb8bc344099e8f813f126f73634dd7`

````text
cast send <your-deployed-contract-address>\
  "store((uint256,string))" \
  '(25,"bob")' \
  --rpc-url http://127.0.0.1:8545 \
  --private-key <your-key>
````

## Block 11

SHA-256: `4187b219c96190fabecc80acfda94bce3b5551e1eed28fe8b65fed9a5effc6e6`

````text
...
transactionHash      0xe69ac7819787dc5ca8e5e5b0420936cdde171fce8760931bce5e0fc03e68cbac
...
````

## Block 12

SHA-256: `337c1a83311713de4449cf273762116154787add7b8d2a2a4643b74b00fa7a8a`

````text
cast rpc eth_getTransactionReceipt \
  '"<your-transaction-hash>"' \
  --rpc-url http://127.0.0.1:8545

# the output shoud have this field
"gasUsed":"0x10944" # Same value we saw before
````

## Block 13

SHA-256: `2fd40063ff05a0ae2df8fe6f63425ae54b354797c242efa309925eb329d2d3e6`

````text
struct Packed {
    uint128 a;
    uint64 b;
    uint64 c;
}
````

## Block 14

SHA-256: `0865f45e4c397b8bd16ff9cbe544b60b3b20baa4fc31ce2ff232d5d47eec54c5`

````text
if (x != newX) {
    x = newX;
}
````

## Block 15

SHA-256: `8d91539b9e9c42621525e89a5177a06555a0101c87dc606aaa41f543aa9afac7`

````text
uint256 localVar = storageVar;
// Use localVar multiple times instead of repeated storage reads
````

## Block 16

SHA-256: `2ec678c8a13c55305ac994a58fe1eebe667df9aa1daaae0d7ee731d1d787968f`

````text
function batchTransfer(address[] calldata recipients) external {
    // cheaper than using memory
}
````

## Block 17

SHA-256: `5dddf4f92579de1092a5cc796ee18223eae5f3800fac98cc30949544393158ed`

````text
for (uint256 i = 0; i < n; ) {     
    // operations     
    unchecked { i++; } 
}
````

## Block 18

SHA-256: `97f124cc32ea4f06f0b3765bbcea6b4c4976c9fb8e43be031699dab83668dcc6`

````text
function withdraw(uint256 amount) external {     
    if (amount == 0) return;     
    require(balances[msg.sender] >= amount, "Insufficient");
    // proceed 
}
````

## Block 19

SHA-256: `19f36b387088d0d211b06ef230dd2010817038e8f22eba00a4e5e474bab4e9b6`

````text
uint256 constant RATE_MULTIPLIER = 1e18;
````

## Block 20

SHA-256: `47b47d80c4b6f0bc80c1f0051326b375ab7776dc1b1774167454e716f52e7ab6`

````text
address public immutable owner; 
constructor() {     
    owner = msg.sender; 
}
````

## Block 21

SHA-256: `0c4a429cb753cf0a8cf9188f65b4125b53a79bb6c10fcf5523239ae4cb0ff7f6`

````text
event TransferLogged(address from, address to, uint256 amount); // emit TransferLogged() instead of storing to an array
````

## Block 22

SHA-256: `e030b4cbad30a6ef09a4f96144f708045ab0998f71828b8bc4dd408dfa2973c9`

````text
assembly {
    // low-level operations
}
````
