# Published examples

Source: https://andreyobruchkov1996.substack.com/p/solidity-execution-overview-payable

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

## Block 7

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

## Block 8

SHA-256: `b35a4445c5c9f91e4fb26dd06e5a4f82783927c137e9ae5aa0ad5e60e868e15e`

````text
require(x > 0, “x must be positive”);
//or
revert(”custom error message”);
````

## Block 9

SHA-256: `11dc988110571029559c7ba33d8dad4491391e1053c9141a10b98c8a80c51320`

````text
function outer() public {
    inner(); // If `inner()` reverts, so does `outer()`
}

function inner() public {
    require(false, “fail”);
}
````

## Block 10

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
