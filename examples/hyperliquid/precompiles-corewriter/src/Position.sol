// Supplemental compiler setup; published block body below is unchanged.
pragma solidity 0.8.30;

struct Position {
    int64 szi;
    uint64 entryNtl;
    int64 isolatedRawUsd;
    uint32 leverage;
    bool isIsolated;
}
