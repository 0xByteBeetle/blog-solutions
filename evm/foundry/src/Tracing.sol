// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract TraceStore {
    struct Record {
        uint256 number;
        string owner;
    }

    error ZeroNumber();
    error EmptyOwner();

    Record private record;

    function store(Record calldata next) external {
        if (next.number == 0) revert ZeroNumber();
        if (bytes(next.owner).length == 0) revert EmptyOwner();
        record = next;
    }

    function retrieve() external view returns (Record memory) {
        return record;
    }
}

contract TraceRouter {
    function routeStore(TraceStore target, uint256 number, string calldata owner) external {
        target.store(TraceStore.Record({number: number, owner: owner}));
    }
}
