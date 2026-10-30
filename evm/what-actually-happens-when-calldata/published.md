# Published examples

Source: https://andreyobruchkov1996.substack.com/p/what-actually-happens-when-calldata

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `de8caf6cc7e423e69bf49f9c78b7f2b57ce33882c42115db79f44c7d3e74ef10`

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

## Block 2

SHA-256: `ac03449a66c5d641f9291938aea674de9a341e107f51371d9912619f28ec057d`

````text
bytecode: “0x608060405234801561001057600080fd5b5060df8061001f6000396000f3006080604052600436106049576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680632e64cec114604e5780636057361d146076575b600080fd5b348015605957600080fd5b50606060a0565b6040518082815260200191505060405180910390f35b348015608157600080fd5b50609e6004803603810190808035906020019092919050505060a9565b005b60008054905090565b80600081905550505600a165627a7a7230582078de35703c2e2e542f27462c54cc554bfaebcea8f777f7df9e1eb1a59a3628660029”

opcodes: “PUSH1 0x80 PUSH1 0x40 MSTORE CALLVALUE DUP1 ISZERO PUSH2 0x10 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0xDF DUP1 PUSH2 0x1F PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN STOP PUSH1 0x80 PUSH1 0x40 MSTORE PUSH1 0x4 CALLDATASIZE LT PUSH1 0x49 JUMPI PUSH1 0x0 CALLDATALOAD PUSH29 0x100000000000000000000000000000000000000000000000000000000 SWAP1 DIV PUSH4 0xFFFFFFFF AND DUP1 PUSH4 0x2E64CEC1 EQ PUSH1 0x4E JUMPI DUP1 PUSH4 0x6057361D EQ PUSH1 0x76 JUMPI JUMPDEST PUSH1 0x0 DUP1 REVERT JUMPDEST CALLVALUE DUP1 ISZERO PUSH1 0x59 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x60 PUSH1 0xA0 JUMP JUMPDEST PUSH1 0x40 MLOAD DUP1 DUP3 DUP2 MSTORE PUSH1 0x20 ADD SWAP2 POP POP PUSH1 0x40 MLOAD DUP1 SWAP2 SUB SWAP1 RETURN JUMPDEST CALLVALUE DUP1 ISZERO PUSH1 0x81 JUMPI PUSH1 0x0 DUP1 REVERT JUMPDEST POP PUSH1 0x9E PUSH1 0x4 DUP1 CALLDATASIZE SUB DUP2 ADD SWAP1 DUP1 DUP1 CALLDATALOAD SWAP1 PUSH1 0x20 ADD SWAP1 SWAP3 SWAP2 SWAP1 POP POP POP PUSH1 0xA9 JUMP JUMPDEST STOP JUMPDEST PUSH1 0x0 DUP1 SLOAD SWAP1 POP SWAP1 JUMP JUMPDEST DUP1 PUSH1 0x0 DUP2 SWAP1 SSTORE POP POP JUMP STOP LOG1 PUSH6 0x627A7A723058 KECCAK256 PUSH25 0xDE35703C2E2E542F27462C54CC554BFAEBCEA8F777F7DF9E1E 0xb1 0xa5 SWAP11 CALLDATASIZE 0x28 PUSH7 0x290000000000”
````

## Block 3

SHA-256: `efb02c60f68cb5db35ef623b405b32142efda64487ec649d10b3061e87ae4079`

````text
PUSH1 0x80
PUSH1 0x40
MSTORE
````

## Block 4

SHA-256: `f73c11d3d05d57e3918f2d140d8961baabe1696a241e1b6b46455acf3ecf7734`

````text
CALLVALUE       ; Pushes msg.value to the stack
DUP1            ; Duplicates it (so we can use it twice)
ISZERO          ; Checks if msg.value == 0
PUSH2 0x0010    ; If zero, jump to the actual logic (offset 0x10)
JUMPI           ; Conditional jump (if value is zero, we’re good)PUSH1 0x00            ; Set offset = 0 for revert data
DUP1            ; Set length = 0 (no error message)
REVERT          ; Abort the transaction with no message
````

## Block 5

SHA-256: `76cfd6e77c6a19e28d452c4a34e83354351c801cedccc54cf2e55471336366e1`

````text
...                   ; [will not be covered here, not so important]
PUSH1 0x4             ; [top] Push constant 4 — minimum selector length
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

## Block 6

SHA-256: `275dff0c6547142187b1c25305230bf6c7b1ccdc78e0ed3c6c766d8644ad7397`

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
