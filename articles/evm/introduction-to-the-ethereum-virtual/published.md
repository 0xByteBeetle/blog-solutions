# Published examples

Source: https://andreyobruchkov1996.substack.com/p/introduction-to-the-ethereum-virtual

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `46f6f66584976eb663f67a6dc6ff2857eaced389d2d1500f65e7718ab936e4c0`

````text
contract CalldataExample {
    string public storedName;    
    function setName(string calldata _name) external {
        // _name is read-only and lives in calldata
        string memory tempName = _name;  // Copy to memory for manipulation if needed
        storedName = tempName;           // Save to persistent storage
    }
}
````
