// Supplemental local signature tests. The constant signing key is a test fixture only.
pragma solidity 0.8.30;
import {PermitVerifier} from "../src/PermitVerifier.sol";

interface Vm {
    function addr(uint256 privateKey) external returns (address);
    function sign(uint256 privateKey, bytes32 digest) external returns (uint8, bytes32, bytes32);
    function warp(uint256 timestamp) external;
}
contract PermitTest {
    Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    uint256 constant FIXTURE_KEY = 0xa11ce;
    address constant SPENDER = address(0xbeef);

    function signature(PermitVerifier verifier, address owner, uint256 deadline) private returns (uint8, bytes32, bytes32) {
        bytes32 domain = keccak256(abi.encode(keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"), keccak256("MyDApp"), keccak256("1"), block.chainid, address(verifier)));
        bytes32 payload = keccak256(abi.encode(verifier.PERMIT_TYPEHASH(), owner, SPENDER, uint256(42), uint256(3), deadline));
        return vm.sign(FIXTURE_KEY, keccak256(abi.encodePacked(hex"1901", domain, payload)));
    }

    function testCorrectTypedSignatureRecoversOwner() public {
        PermitVerifier verifier = new PermitVerifier();
        address owner = vm.addr(FIXTURE_KEY);
        (uint8 v, bytes32 r, bytes32 s) = signature(verifier, owner, 1000);
        require(verifier.verifyPermit(owner, SPENDER, 42, 3, 1000, v, r, s), "valid typed signature");
    }

    function testChangedTupleFieldsRejectTheSameSignature() public {
        PermitVerifier verifier = new PermitVerifier();
        address owner = vm.addr(FIXTURE_KEY);
        (uint8 v, bytes32 r, bytes32 s) = signature(verifier, owner, 1000);
        require(!verifier.verifyPermit(owner, SPENDER, 43, 3, 1000, v, r, s), "value bound");
        require(!verifier.verifyPermit(owner, address(1), 42, 3, 1000, v, r, s), "spender bound");
        require(!verifier.verifyPermit(owner, SPENDER, 42, 4, 1000, v, r, s), "nonce field bound");
    }

    function testVerifierAddressIsPartOfDomain() public {
        PermitVerifier first = new PermitVerifier();
        PermitVerifier second = new PermitVerifier();
        address owner = vm.addr(FIXTURE_KEY);
        (uint8 v, bytes32 r, bytes32 s) = signature(first, owner, 1000);
        require(!second.verifyPermit(owner, SPENDER, 42, 3, 1000, v, r, s), "verifier domain bound");
    }

    function testOriginalVerifierDoesNotEnforceExpiryOrConsumeNonce() public {
        vm.warp(100);
        PermitVerifier verifier = new PermitVerifier();
        address owner = vm.addr(FIXTURE_KEY);
        (uint8 v, bytes32 r, bytes32 s) = signature(verifier, owner, 0);
        require(verifier.verifyPermit(owner, SPENDER, 42, 3, 0, v, r, s), "original verifies expired payload");
        require(verifier.verifyPermit(owner, SPENDER, 42, 3, 0, v, r, s), "original does not consume nonce");
        // This view helper verifies signatures; application replay/expiry policy is separate.
    }
}
