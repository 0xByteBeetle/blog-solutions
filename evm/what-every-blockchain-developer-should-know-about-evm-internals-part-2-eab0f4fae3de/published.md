# Published examples

Source: https://andreyobruchkov1996.substack.com/p/what-every-blockchain-developer-should-know-about-evm-internals-part-2-eab0f4fae3de

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `13254ccf483cdacf0fa929032368e601656ffa5fea6f602a1e0711a568d4f5c5`

````text
// For functions
function deposit() external payable {
    // msg.value contains the ETH sent with the call
}

// For addresses
address payable recipient = payable(someAddress);
recipient.transfer(1 ether);
````

## Block 2

SHA-256: `28198e1544f1bfab37e0939380a811fe80c504005c6fbc8207aaf210879a598a`

````text
receive() external payable { ... }
````

## Block 3

SHA-256: `b7d1f81e4b37fd7fc25b411d57a99adbd9b934bad2c968804ac50c1d8e50435d`

````text
contract MyContract{
    event Received(address sender, uint amount);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
````

## Block 4

SHA-256: `7d3466b8993771480140c4eafa80079b30ecedb1ed2f6918e145ec9749e22529`

````text
fallback() external [payable] { ... }
// or with calldata access and return:
fallback(bytes calldata input) external [payable] returns (bytes memory)
````

## Block 5

SHA-256: `4a47de1ca01e0d3c007a73fc067bc202af0adcd1cf29a14f3595c144cba89992`

````text
contract Example {
    fallback() external payable {
        // triggered on unknown function calls or empty calldata if no `receive()`
    }
}
````

## Block 6

SHA-256: `76ab8e95ca1cf54524f54322e7a99ee286755f4725420fdd60ca40da9f012be6`

````text
pragma solidity 0.4.25;

contract Example {
    uint data;

    function set(uint x) public {
        data = x;
    }

    function get() public view returns (uint) {
        return data;
    }
}
````

## Block 7

SHA-256: `f281cd03f944123eda6abec58fc68b317afc45b8fa24fed6426de255f2e40a0b`

````text
bytecode: "0x608060405234801561001057600080fd5b5060df8061001f6000396000f3006080604052600436106049576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632e64cec114604e5780636057361d146076575b600080fd5b348015605957600080fd5b50606060a0565b6040518082815260200191505060405180910390f35b348015608157600080fd5b50609e6004803603810190808035906020019092919050505060a9565b005b60008054905090565b80600081905550505600a165627a7a7230582078de35703c2e2e542f27462c54cc554bfaebcea8f777f7df9e1eb1a59a3628660029"
opcodes: "PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0xDF DUP1 PUSH2 0x1F PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN STOP PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x4 CALLDATASIZE LT PUSH1 0x49 JUMPI PUSH1 0x0 CALLDATALOAD PUSH29 0x100000000000000000000000000000000000000000000000000000000 SWAP1 DIV PUSH4 0xFFFFFFFF AND DUP1 PUSH4 0x2E64CEC1 EQ PUSH1 0x4E JUMPI DUP1 PUSH4 0x6057361D EQ PUSH1 0x76 JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST CALLVALUE DUP1 ISZERO PUSH1 0x59 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x60 PUSH1 0xA0 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH1 0x81 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x9E PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH1 0xA9 JUMP JUMPDEST STOP JUMPDEST PUSH1 0x0 DUP1 SLOAD SWAP1 POP SWAP1 JUMP JUMPDEST DUP1 PUSH1 0x0 DUP2 SWAP1 SSTORE POP POP JUMP STOP LOG1 PUSH6 0x627A7A723058 KECCAK256 PUSH25 0xDE35703C2E2E542F27462C54CC554BFAEBCEA8F777F7DF9E1E 0xb1 0xa5 SWAP11 CALLDATASIZE 0x28 PUSH7 0x290000000000"
````

## Block 8

SHA-256: `efb02c60f68cb5db35ef623b405b32142efda64487ec649d10b3061e87ae4079`

````text
PUSH1 0x80
PUSH1 0x40
MSTORE
````

## Block 9

SHA-256: `d185e20a412d7ba14617e618dcd09c101661938fa6b44dbbe0700318e73f0b9f`

````text
CALLVALUE       ; Pushes msg.value to the stack
DUP1            ; Duplicates it (so we can use it twice)
ISZERO          ; Checks if msg.value == 0
PUSH2 0x0010    ; If zero, jump to the actual logic (offset 0x10)
JUMPI           ; Conditional jump (if value is zero, we’re good)

PUSH1 0x00      ; Set offset = 0 for revert data
DUP1            ; Set length = 0 (no error message)
REVERT          ; Abort the transaction with no message
````

## Block 10

SHA-256: `d8343ad698a07a5ff329719da94347307e9c6022a0eb91a4f2d3176a76745b00`

````text
...                   ; [will not be covered here, not so important]
PUSH1 0x4            ; [top] Push constant 4 — minimum selector length
CALLDATASIZE          ; [next] Push the size of calldata
LT                    ; Compare: is calldataSize < 4?
PUSH1 0x49            ; If true, jump to fallback
JUMPI

CALLDATALOAD          ; Load the first 32 bytes of calldata onto the stack
PUSH29 0x100000000000000000000000000000000000000000000000000000000  ; Bitmask: isolates the top 4 bytes (first 4 bytes of calldata)
SWAP1                 ; Swap mask and calldata so mask is on top
DIV                   ; Shifts the selector down by 28 bytes (removes trailing zeros)
PUSH4 0xffffffff      ; 0xFFFFFFFF mask to ensure only the first 4 bytes remain
AND                   ; Final cleanup to get the 4-byte selector exactly
````

## Block 11

SHA-256: `749a2fdac55dd913d229774e6eb864232164c8c608863f770d40d80566887b34`

````text
DUP1                   ; Duplicate selector
PUSH4 0x2E64CEC1       ; First function selector in contract
EQ                     ; Is it equal?
PUSH1 0x4E
JUMPI                  ; If yes, jump to that function’s code

DUP1                   ; Still same selector on stack
PUSH4 0x6057361D       ; Second function selector
EQ
PUSH1 0x76
JUMPI                  ; If match, jump to other function

JUMPDEST               ; If none matched...
PUSH1 0x00
DUP1
REVERT                 ; Revert: function not found
...                    ; [will not be covered here]
````

## Block 12

SHA-256: `b2f94405a94fe28bb635890bf3ef850ffb3abd73f909d014d9536ba3bee6fbd7`

````text
contract MyContract {
    function publicCaller() public {
        internalFunction(); // Internal call
    }

    function internalFunction() internal {
        // logic here
    }
}
````

## Block 13

SHA-256: `fb1df9bd4f35a01f16ee3804df61204e31ef972b92c68c7d898730b7bd08987e`

````text
interface Token {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract Caller {
    function paySomeone(address token, address recipient, uint256 amount) external {
        // External call: ABI-encoded calldata is sent to the token contract
        Token(token).transfer(recipient, amount);
    }
}
````

## Block 14

SHA-256: `26c26792876b85649eff6c75916c72991c0a169763493ea062f8f60eae31e185`

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

## Block 15

SHA-256: `2a50b0f0f8dfbd98f80d779dfe461fa0a90223f02fe93bb6e2782960391f9cdb`

````text
[
 {
  "inputs": [
   {
    "components": [
     {
      "internalType": "uint256",
      "name": "number",
      "type": "uint256"
     },
     {
      "internalType": "string",
      "name": "owner",
      "type": "string"
     }
    ],
    "internalType": "struct Storage.my_storage_struct",
    "name": "new_storage",
    "type": "tuple"
   }
  ],
  "name": "store",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
 },
 {
  "inputs": [],
  "name": "retrieve",
  "outputs": [
   {
    "components": [
     {
      "internalType": "uint256",
      "name": "number",
      "type": "uint256"
     },
     {
      "internalType": "string",
      "name": "owner",
      "type": "string"
     }
    ],
    "internalType": "struct Storage.my_storage_struct",
    "name": "",
    "type": "tuple"
   }
  ],
  "stateMutability": "view",
  "type": "function"
 }
]
````

## Block 16

SHA-256: `031f24b2fffa736004fe15a6a0b4b9f8d19d4570e475d39288f4980674ab419c`

````text
0xddd356b3
0000000000000000000000000000000000000000000000000000000000000020
00000000000000000000000000000000000000000000000000000000075bcd15
0000000000000000000000000000000000000000000000000000000000000040
0000000000000000000000000000000000000000000000000000000000000003
626f620000000000000000000000000000000000000000000000000000000000
````

## Block 17

SHA-256: `17d064bf5cbe93ac94211a50b7df5671a423ac34ae6a613df9a7a5c8cd9cd26d`

````text
(uint256 number, string memory owner) = abi.decode(returnData, (uint256, string));

// you will get
number = 123456789
owner = "bob"
````

## Block 18

SHA-256: `fccda4022e396d271f8b0327d464a835d0fd1cb6daa5097ac98aeeff33b98d50`

````text
require(x > 0, "x must be positive");
//or
revert("custom error message");
````

## Block 19

SHA-256: `1c879ebef4a4f7d1ee733c7a2cc4e153b1d5c8a5d811751f4dd95b0a3efcadf3`

````text
function outer() public {
    inner(); // If `inner()` reverts, so does `outer()`
}

function inner() public {
    require(false, "fail");
}
````

## Block 20

SHA-256: `76bed6e2db44afbb49daa70c20876895d1f4d111253daa88f5134d5255204c46`

````text
try otherContract.doSomething() {
    // success
} catch Error(string memory reason) {
    // reason is the revert message
} catch {
    // catch all (e.g., invalid opcode)
}
````
