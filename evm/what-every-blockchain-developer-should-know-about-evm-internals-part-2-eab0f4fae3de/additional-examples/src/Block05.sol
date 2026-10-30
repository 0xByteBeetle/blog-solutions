// Supplemental compiler pragma; exact published body follows unchanged.
pragma solidity 0.8.30;

contract Example {
    fallback() external payable {
        // triggered on unknown function calls or empty calldata if no `receive()`
    }
}
