// Supplemental compiler pragma; exact published body follows unchanged.
pragma solidity 0.8.30;

contract MyContract{
    event Received(address sender, uint amount);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
