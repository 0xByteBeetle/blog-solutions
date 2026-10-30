// Supplemental mocks/assertions. Not published author code or native HyperCore execution.
pragma solidity 0.8.30;
import {HyperCoreRead} from "../src/HyperCoreRead.sol";
import {HyperCoreBbo} from "../src/HyperCoreBbo.sol";
import {HyperCoreBalances} from "../src/HyperCoreBalances.sol";
import {WrongOracle} from "../src/WrongOracle.sol";
import {UsdClassTransfer} from "../src/UsdClassTransfer.sol";
import {HyperCoreLimitOrder} from "../src/HyperCoreLimitOrder.sol";
import {PriceScale} from "../src/PriceScale.sol";

interface Vm {
    function mockCall(address, bytes calldata, bytes calldata) external;
    function mockCallRevert(address, bytes calldata, bytes calldata) external;
    function expectRevert() external;
    function expectRevert(bytes calldata) external;
    function expectCall(address, bytes calldata) external;
    function etch(address, bytes calldata) external;
}
contract ReadHarness {
    function wrongOracle(uint32 index) external view returns (uint64) { return WrongOracle(address(0x807)).oraclePx(index); }
    function oracle(uint32 index) external view returns (uint64) { return HyperCoreRead.oraclePx(index); }
    function bbo(uint32 index) external view returns (HyperCoreBbo.Bbo memory) { return HyperCoreBbo.bbo(index); }
    function balance(address user,uint64 token) external view returns (HyperCoreBalances.SpotBalance memory) { return HyperCoreBalances.spotBalance(user,token); }
    function scale(uint64 raw,uint8 decimals) external pure returns(uint256) { return PriceScale.normalizePerpPrice(raw,decimals); }
}
contract RecordingWriter {
    bytes public lastData;
    address public lastSender;
    function sendRawAction(bytes calldata data) external { lastData=data;lastSender=msg.sender; }
}
contract PublishedExamplesTest {
    Vm constant vm=Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    address constant ORACLE=address(0x807);
    address constant BBO=address(0x80e);
    address constant BALANCE=address(0x801);
    address constant WRITER=0x3333333333333333333333333333333333333333;
    ReadHarness h;
    function setUp() public { h=new ReadHarness();vm.etch(WRITER,type(RecordingWriter).runtimeCode); }
    function testOracleUsesRawAbiWithoutSelector() public {
        bytes memory input=abi.encode(uint32(3));
        require(input.length==32);
        vm.mockCall(ORACLE,input,abi.encode(uint64(631381)));
        vm.expectCall(ORACLE,input);
        require(h.oracle(3)==631381);
        bytes memory wrong=abi.encodeWithSelector(WrongOracle.oraclePx.selector,uint32(3));
        require(wrong.length==36 && keccak256(wrong)!=keccak256(input));
        // Negative interface compiles, but prefixes a selector not in raw ABI.
        vm.mockCallRevert(ORACLE,wrong,hex"bad0");
        vm.expectRevert(hex"bad0");h.wrongOracle(3);
    }
    function testBboTupleDecodingAndRawIndex() public {
        vm.mockCall(BBO,abi.encode(uint32(3)),abi.encode(uint64(631610),uint64(631850)));
        vm.expectCall(BBO,abi.encode(uint32(3)));
        HyperCoreBbo.Bbo memory out=h.bbo(3);
        require(out.bid==631610 && out.ask==631850);
    }
    function testBalanceAddressAndUint64Encoding() public {
        address user=address(0xbeef);uint64 token=type(uint64).max;
        bytes memory input=abi.encode(user,token);require(input.length==64);
        vm.mockCall(BALANCE,input,abi.encode(uint64(100),uint64(25),uint64(7)));
        vm.expectCall(BALANCE,input);
        HyperCoreBalances.SpotBalance memory out=h.balance(user,token);
        require(out.total==100 && out.hold==25 && out.entryNtl==7);
    }
    function testOracleFailureAndMalformedOutputReject() public {
        vm.mockCallRevert(ORACLE,abi.encode(uint32(1)),hex"1234");
        vm.expectRevert(abi.encodeWithSignature("Error(string)","oraclePx precompile failed"));h.oracle(1);
        vm.mockCall(ORACLE,abi.encode(uint32(2)),hex"01");
        vm.expectRevert();h.oracle(2);
    }
    function testBboAndBalanceFailuresReject() public {
        vm.mockCallRevert(BBO,abi.encode(uint32(1)),hex"01");
        vm.expectRevert(abi.encodeWithSignature("Error(string)","bbo precompile failed"));h.bbo(1);
        vm.mockCallRevert(BALANCE,abi.encode(address(1),uint64(2)),hex"01");
        vm.expectRevert(abi.encodeWithSignature("Error(string)","spotBalance precompile failed"));h.balance(address(1),2);
    }
    function testPriceScaleAndDecimalsBoundary() public view {
        require(h.scale(631610,5)==63161*1e18);
        require(h.scale(1,0)==1e12);
        require(h.scale(1,6)==1e18);
        require(h.scale(0,6)==0);
        require(h.scale(type(uint64).max,6)==uint256(type(uint64).max)*1e18);
    }
    function testPriceScaleUnsupportedDecimalsRevert() public {
        vm.expectRevert(abi.encodeWithSignature("Panic(uint256)",uint256(0x11)));h.scale(1,7);
    }
    function testUsdActionHeaderAndBodyAndCaller() public {
        UsdClassTransfer transfer=new UsdClassTransfer();transfer.transferUsdClass(type(uint64).max,true);
        bytes memory data=RecordingWriter(WRITER).lastData();
        require(data.length==68 && keccak256(data)==keccak256(bytes.concat(hex"01000007",abi.encode(type(uint64).max,true))));
        require(RecordingWriter(WRITER).lastSender()==address(transfer));
        transfer.transferUsdClass(0,false);
        require(keccak256(RecordingWriter(WRITER).lastData())==keccak256(bytes.concat(hex"01000007",abi.encode(uint64(0),false))));
    }
    function testLimitOrderHeaderAndEveryField() public {
        HyperCoreLimitOrder orders=new HyperCoreLimitOrder();
        orders.placeLimitOrder(type(uint32).max,true,type(uint64).max,42,true,3,type(uint128).max);
        bytes memory data=RecordingWriter(WRITER).lastData();
        bytes memory expected=bytes.concat(hex"01000001",abi.encode(type(uint32).max,true,type(uint64).max,uint64(42),true,uint8(3),type(uint128).max));
        require(data.length==228 && keccak256(data)==keccak256(expected));
        require(RecordingWriter(WRITER).lastSender()==address(orders));
    }
    function testLowLevelOrderDoesNotValidateZeroSizeOrTif() public {
        HyperCoreLimitOrder orders=new HyperCoreLimitOrder();orders.placeLimitOrder(0,false,0,0,false,255,0);
        require(keccak256(RecordingWriter(WRITER).lastData())==keccak256(bytes.concat(hex"01000001",abi.encode(uint32(0),false,uint64(0),uint64(0),false,uint8(255),uint128(0)))));
        // This demonstrates missing local policy only; native acceptance NOT claimed.
    }
}
