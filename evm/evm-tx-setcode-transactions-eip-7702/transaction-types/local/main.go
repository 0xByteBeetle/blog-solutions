// Supplemental native EIP-7702 reproduction on an owned Prague Anvil only.
// Public fixture keys 1, 2 and Anvil account 0 must NEVER be funded publicly.
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"math/big"
	"net"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/holiman/uint256"
)

const deployKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

func command(ctx context.Context, dir string, args ...string) (string, error) {
	c := exec.CommandContext(ctx, args[0], args[1:]...)
	c.Dir = dir
	c.Stderr = os.Stderr
	out, e := c.Output()
	return strings.TrimSpace(string(out)), e
}
func deploy(ctx context.Context, client *ethclient.Client, dir, url, name string) (common.Address, error) {
	out, e := command(ctx, dir, "forge", "create", "src/"+name+".sol:"+name, "--broadcast", "--json", "--rpc-url", url, "--private-key", deployKey)
	if e != nil {
		return common.Address{}, fmt.Errorf("local deploy %s: %w", name, e)
	}
	var result struct {
		DeployedTo string `json:"deployedTo"`
	}
	if e = json.Unmarshal([]byte(out), &result); e != nil {
		return common.Address{}, e
	}
	if !common.IsHexAddress(result.DeployedTo) {
		return common.Address{}, fmt.Errorf("deployment omitted address")
	}
	address := common.HexToAddress(result.DeployedTo)
	expected, e := command(ctx, dir, "forge", "inspect", "src/"+name+".sol:"+name, "deployedBytecode")
	if e != nil {
		return address, e
	}
	code, e := client.CodeAt(ctx, address, nil)
	if e != nil {
		return address, e
	}
	if len(code) == 0 || !bytes.Equal(code, common.FromHex(expected)) {
		return address, fmt.Errorf("deployed runtime bytecode mismatch")
	}
	return address, nil
}
func triggerData(authorities []common.Address) ([]byte, error) {
	parsed, e := abi.JSON(strings.NewReader(`[{"type":"function","name":"triggerPings","inputs":[{"name":"froms","type":"address[]"}],"outputs":[],"stateMutability":"nonpayable"}]`))
	if e != nil {
		return nil, e
	}
	data, e := parsed.Pack("triggerPings", authorities)
	if e != nil {
		return nil, e
	}
	// Independently construct dynamic-array offset/length/address words.
	manual := append([]byte{}, crypto.Keccak256([]byte("triggerPings(address[])"))[:4]...)
	manual = append(manual, common.LeftPadBytes(big.NewInt(32).Bytes(), 32)...)
	manual = append(manual, common.LeftPadBytes(big.NewInt(int64(len(authorities))).Bytes(), 32)...)
	for _, a := range authorities {
		manual = append(manual, common.LeftPadBytes(a.Bytes(), 32)...)
	}
	if !bytes.Equal(data, manual) {
		return nil, fmt.Errorf("triggerPings ABI words mismatch")
	}
	return data, nil
}
func run(parent context.Context) error {
	ctx, cancel := context.WithTimeout(parent, 90*time.Second)
	defer cancel()
	version, e := command(ctx, ".", "anvil", "--version")
	if e != nil {
		return e
	}
	if !strings.Contains(version, "1.4.4") {
		return fmt.Errorf("requires installed Anvil 1.4.4; no upgrade attempted")
	}
	cwd, e := os.Getwd()
	if e != nil {
		return e
	}
	dir := filepath.Join(cwd, "..", "delegation")
	if _, e = os.Stat(filepath.Join(dir, "foundry.toml")); e != nil {
		return fmt.Errorf("run from this article's transaction-types directory: %w", e)
	}
	listener, e := net.Listen("tcp", "127.0.0.1:0")
	if e != nil {
		return e
	}
	port := listener.Addr().(*net.TCPAddr).Port
	listener.Close()
	url := fmt.Sprintf("http://127.0.0.1:%d", port)
	node := exec.Command("anvil", "--host", "127.0.0.1", "--port", fmt.Sprint(port), "--chain-id", "31337", "--hardfork", "prague", "--silent")
	node.Stdout = os.Stderr
	node.Stderr = os.Stderr
	if e = node.Start(); e != nil {
		return e
	}
	defer func() {
		_ = node.Process.Signal(syscall.SIGTERM)
		done := make(chan error, 1)
		go func() { done <- node.Wait() }()
		select {
		case <-done:
		case <-time.After(5 * time.Second):
			_ = node.Process.Kill()
			<-done
		}
	}()
	client, e := ethclient.DialContext(ctx, url)
	if e != nil {
		return e
	}
	defer client.Close()
	var chain *big.Int
	for i := 0; i < 100; i++ {
		if err := ctx.Err(); err != nil {
			return err
		}
		chain, e = client.ChainID(ctx)
		if e == nil {
			break
		}
		time.Sleep(50 * time.Millisecond)
	}
	if e != nil {
		return fmt.Errorf("owned Prague Anvil did not start: %w", e)
	}
	if chain.Cmp(big.NewInt(31337)) != 0 {
		return fmt.Errorf("unexpected local chain ID")
	}
	var info struct {
		HardFork string `json:"hardFork"`
	}
	if e = client.Client().CallContext(ctx, &info, "anvil_nodeInfo"); e != nil {
		return fmt.Errorf("Anvil capability read failed: %w", e)
	}
	if !strings.EqualFold(info.HardFork, "prague") {
		return fmt.Errorf("native 7702 requires Prague; got %q", info.HardFork)
	}
	var clientVersion string
	if e = client.Client().CallContext(ctx, &clientVersion, "web3_clientVersion"); e != nil {
		return e
	}
	if !strings.Contains(strings.ToLower(clientVersion), "anvil") {
		return fmt.Errorf("not an Anvil client")
	}
	// Capability and owned-loopback checks precede all deployment/submission.
	module, e := deploy(ctx, client, dir, url, "Invoked")
	if e != nil {
		return e
	}
	invoker, e := deploy(ctx, client, dir, url, "MultiDelegationInvoker")
	if e != nil {
		return e
	}
	key1, _ := crypto.HexToECDSA(fmt.Sprintf("%064x", 1))
	key2, _ := crypto.HexToECDSA(fmt.Sprintf("%064x", 2))
	authorities := []common.Address{crypto.PubkeyToAddress(key1.PublicKey), crypto.PubkeyToAddress(key2.PublicKey)}
	nonces := make([]uint64, 2)
	for i, a := range authorities {
		nonce, e := client.PendingNonceAt(ctx, a)
		if e != nil {
			return e
		}
		code, e := client.CodeAt(ctx, a, nil)
		if e != nil {
			return e
		}
		nonces[i] = nonce
		if nonce != 0 || len(code) != 0 {
			return fmt.Errorf("authority fixture is not fresh")
		}
	}
	var ignored any
	if e = client.Client().CallContext(ctx, &ignored, "anvil_setBalance", authorities[1], hexutil.EncodeBig(new(big.Int).Mul(big.NewInt(100), big.NewInt(1e18)))); e != nil {
		return e
	}
	data, e := triggerData(authorities)
	if e != nil {
		return e
	}
	first, e := types.SignSetCode(key1, types.SetCodeAuthorization{ChainID: *uint256.NewInt(31337), Address: module, Nonce: nonces[0]})
	if e != nil {
		return e
	}
	second, e := types.SignSetCode(key2, types.SetCodeAuthorization{ChainID: *uint256.NewInt(31337), Address: module, Nonce: nonces[1] + 1})
	if e != nil {
		return e
	}
	for i, a := range []types.SetCodeAuthorization{first, second} {
		who, e := a.Authority()
		if e != nil || who != authorities[i] {
			return fmt.Errorf("authorization signer mismatch")
		}
	}
	tip, e := client.SuggestGasTipCap(ctx)
	if e != nil {
		return e
	}
	price, e := client.SuggestGasPrice(ctx)
	if e != nil {
		return e
	}
	tx := types.NewTx(&types.SetCodeTx{ChainID: uint256.NewInt(31337), Nonce: nonces[1], GasTipCap: uint256.MustFromBig(tip), GasFeeCap: uint256.MustFromBig(new(big.Int).Add(price, tip)), Gas: 120000, To: invoker, Data: data, AuthList: []types.SetCodeAuthorization{first, second}})
	signed, e := types.SignTx(tx, types.LatestSignerForChainID(chain), key2)
	if e != nil {
		return e
	}
	if e = client.SendTransaction(ctx, signed); e != nil {
		return fmt.Errorf("native SetCode submission rejected: %w", e)
	}
	var receipt *types.Receipt
	for i := 0; i < 100; i++ {
		receipt, e = client.TransactionReceipt(ctx, signed.Hash())
		if e == nil {
			break
		}
		if !errors.Is(e, ethereum.NotFound) {
			return e
		}
		time.Sleep(50 * time.Millisecond)
	}
	if e != nil {
		return e
	}
	if receipt.Status != 1 || receipt.Type != 4 {
		return fmt.Errorf("SetCode receipt unsuccessful or wrong type")
	}
	observed, pending, e := client.TransactionByHash(ctx, signed.Hash())
	if e != nil {
		return e
	}
	if pending || observed.Type() != 4 || !bytes.Equal(observed.Data(), data) || len(observed.SetCodeAuthorizations()) != 2 {
		return fmt.Errorf("mined SetCode input mismatch")
	}
	for i, a := range observed.SetCodeAuthorizations() {
		if a.Nonce != []uint64{nonces[0], nonces[1] + 1}[i] || a.Address != module || a.ChainID.Uint64() != 31337 {
			return fmt.Errorf("mined authorization mismatch")
		}
	}
	designation := append([]byte{0xef, 0x01, 0x00}, module.Bytes()...)
	for i, a := range authorities {
		code, e := client.CodeAt(ctx, a, nil)
		if e != nil {
			return e
		}
		nonce, e := client.NonceAt(ctx, a, nil)
		if e != nil {
			return e
		}
		expectedNonce := nonces[i] + uint64(i+1) // other authority 0→1; outer sender 0→1 then auth 1→2.
		if !bytes.Equal(code, designation) || nonce != expectedNonce {
			return fmt.Errorf("native designation/nonce mismatch for %s", a)
		}
	}
	if len(receipt.Logs) != 5 {
		return fmt.Errorf("expected PingStart, two Pinged and two PingSuccess events")
	}
	names := []string{"PingStart(address)", "Pinged(address)", "PingSuccess(address)", "Pinged(address)", "PingSuccess(address)"}
	emitters := []common.Address{invoker, module, invoker, module, invoker}
	values := []common.Address{authorities[1], invoker, authorities[0], invoker, authorities[1]}
	for i, l := range receipt.Logs {
		if l.Address != emitters[i] || len(l.Topics) != 1 || l.Topics[0] != crypto.Keccak256Hash([]byte(names[i])) || !bytes.Equal(l.Data, common.LeftPadBytes(values[i].Bytes(), 32)) {
			return fmt.Errorf("event %d caller/emitter mismatch", i)
		}
	}
	if e = client.Client().CallContext(ctx, &ignored, "evm_mine"); e != nil {
		return e
	}
	for _, a := range authorities {
		code, e := client.CodeAt(ctx, a, nil)
		if e != nil {
			return e
		}
		if !bytes.Equal(code, designation) {
			return fmt.Errorf("designation did not persist after another block")
		}
	}
	output := map[string]any{"hardfork": info.HardFork, "chainId": 31337, "transaction": signed.Hash(), "type": receipt.Type, "gasUsed": receipt.GasUsed, "calldataBytes": len(data), "authorizationNonces": []uint64{nonces[0], nonces[1] + 1}, "finalAccountNonces": []int{1, 2}, "module": module, "invoker": invoker, "pingedCaller": invoker, "eventCount": len(receipt.Logs), "designationPersistsAfterNextBlock": true}
	out, _ := json.MarshalIndent(output, "", "  ")
	fmt.Println(string(out))
	return nil
}
func main() {
	execute := flag.Bool("execute-local", false, "start an owned Prague Anvil and submit only public fixture transactions")
	flag.Parse()
	if flag.NArg() != 0 {
		fmt.Fprintln(os.Stderr, "Unexpected arguments; no external RPC or wallet is accepted")
		os.Exit(2)
	}
	if !*execute {
		fmt.Println("Plan only: owned Prague Anvil → deploy printed module/invoker → triggerPings calldata → two native authorizations → local type-4 send/receipt → code, nonces and event assertions. Use --execute-local to run; public NEVER-FUND fixtures only.")
		return
	}
	os.Exit(executeWithSignals())
}

func executeWithSignals() int {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	signals := make(chan os.Signal, 1)
	signal.Notify(signals, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(signals)
	interrupted := make(chan int, 1)
	go func() {
		select {
		case s := <-signals:
			interrupted <- 128 + int(s.(syscall.Signal))
			cancel()
		case <-ctx.Done():
		}
	}()
	err := run(ctx)
	select {
	case code := <-interrupted:
		return code
	default:
	}
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 1
	}
	return 0
}
