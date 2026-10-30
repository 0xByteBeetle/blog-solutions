// Supplemental compiler pragma; exact published body follows unchanged.
pragma solidity 0.8.30;

contract CalldataExample {
    string public storedName;    
    function setName(string calldata _name) external {
        // _name is read-only and lives in calldata
        string memory tempName = _name;  // Copy to memory for manipulation if needed
        storedName = tempName;           // Save to persistent storage
    }
}
