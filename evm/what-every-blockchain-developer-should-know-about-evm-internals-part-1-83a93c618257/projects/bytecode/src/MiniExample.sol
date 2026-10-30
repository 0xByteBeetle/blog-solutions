pragma solidity >=0.4.16 <0.9.0;

contract MiniExample {
    uint data;
    function set(uint x) public {
        data = x;
    }
    function get() public view returns (uint) {
        return data;
    }
}
