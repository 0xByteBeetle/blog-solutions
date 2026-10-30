// Supplemental compiler pragma; exact published body follows unchanged.
pragma solidity 0.8.30;

interface Token {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract Caller {
    function paySomeone(address token, address recipient, uint256 amount) external {
        // External call: ABI-encoded calldata is sent to the token contract
        Token(token).transfer(recipient, amount);
    }
}
