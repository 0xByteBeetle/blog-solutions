// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

/*
 * Very simplified UUPS pattern.
 * - Proxy stores state and delegates calls.
 * - Implementation holds upgrade logic.
 */
// ---------------- Proxy ----------------
contract UUPSProxy {
    // Code position in storage is keccak256("PROXIABLE") = "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7"
    constructor(bytes memory constructData, address contractLogic) {
        // save the code address
        assembly {
            sstore(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7, contractLogic)
        }
        // call the constructor
        (bool success,  ) = contractLogic.delegatecall(constructData);
        require(success, "Construction failed");
    }
    // This fallback will actually call the logic contract
    // because every function with databytes will arrive here
    fallback() external payable {
        assembly {
            // load the logic contract address
            let contractLogic := sload(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7)
            calldatacopy(0x0, 0x0, calldatasize())
            // call the logic contract with the databytes
            let success := delegatecall(sub(gas(), 10000), contractLogic, 0x0, calldatasize(), 0, 0)
            let retSz := returndatasize()
            returndatacopy(0, 0, retSz)
            switch success
            case 0 {
                revert(0, retSz)
            }
            default {
                return(0, retSz)
            }
        }
    }
}
