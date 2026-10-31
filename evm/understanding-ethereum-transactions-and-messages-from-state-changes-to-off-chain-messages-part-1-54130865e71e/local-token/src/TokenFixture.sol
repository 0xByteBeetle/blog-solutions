// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;
// Supplemental local prerequisite replacing the article's historical deployed token.
// Only the transfer/balance behavior required by its exact calldata is represented.
contract TokenFixture {
    mapping(address => uint256) public balanceOf;
    event Transfer(address indexed from, address indexed to, uint256 value);
    constructor() { balanceOf[0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF] = 1 ether; }
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient fixture balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}
