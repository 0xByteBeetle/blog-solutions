// Supplemental compiler setup; published block body below is unchanged.
pragma solidity 0.8.30;

interface WrongOracle {
    function oraclePx(uint32 index) external view returns (uint64);
}
