// Supplemental compiler pragma; exact published body follows unchanged.
pragma solidity 0.8.30;

contract MyContract {
    function publicCaller() public {
        internalFunction(); // Internal call
    }

    function internalFunction() internal {
        // logic here
    }
}
