// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract UnpackedStorage {
    uint128 public first;
    uint256 public middle;
    uint128 public last;

    function set(uint128 first_, uint256 middle_, uint128 last_) external {
        first = first_;
        middle = middle_;
        last = last_;
    }
}

contract PackedStorage {
    uint128 public first;
    uint128 public last;
    uint256 public middle;

    function set(uint128 first_, uint256 middle_, uint128 last_) external {
        first = first_;
        last = last_;
        middle = middle_;
    }
}

contract StorageReadPatterns {
    uint256 public value = 7;

    function readValue() external view returns (uint256) {
        return value;
    }

    function fourStorageReads() external view returns (uint256 total) {
        return this.readValue() + this.readValue() + this.readValue() + this.readValue();
    }

    function oneStorageRead() external view returns (uint256 total) {
        uint256 cached = value;
        return cached + cached + cached + cached;
    }
}

contract BatchCounter {
    uint256 public total;

    function addAll(uint256[] calldata values) external {
        uint256 length = values.length;
        uint256 running = total;
        for (uint256 index; index < length;) {
            running += values[index];
            unchecked {
                index++;
            }
        }
        total = running;
    }
}
