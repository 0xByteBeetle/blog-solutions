pragma solidity ^0.8.12;

import "forge-std/Script.sol";
import "../src/Storage.sol";
contract DebugStore is Script {
    function run() external {
        Storage s = new Storage();
        s.store(Storage.my_storage_struct({ number: 101, owner: "bob" }));
    }
}
