// Supplemental article-local query → sign → submit → receipt reproduction.
// Only an owned loopback Anvil and public NEVER-FUND fixture keys are accepted.
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"math/big"
	"net"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

func stop(node *exec.Cmd) {
	_ = node.Process.Signal(syscall.SIGTERM)
	done := make(chan error, 1)
	go func() { done <- node.Wait() }()
	select {
	case <-done:
	case <-time.After(5 * time.Second):
		_ = node.Process.Kill()
		<-done
	}
}
func run(parent context.Context) error {
	ctx, cancel := context.WithTimeout(parent, 120*time.Second)
	defer cancel()
	version, e := exec.CommandContext(ctx, "anvil", "--version").Output()
	if e != nil {
		return e
	}
	if !strings.Contains(string(version), "1.4.4") {
		return fmt.Errorf("requires installed Anvil 1.4.4; no upgrade attempted")
	}
	socket, e := net.Listen("tcp", "127.0.0.1:0")
	if e != nil {
		return e
	}
	port := socket.Addr().(*net.TCPAddr).Port
	socket.Close()
	url := fmt.Sprintf("http://127.0.0.1:%d", port)
	node := exec.Command("anvil", "--host", "127.0.0.1", "--port", fmt.Sprint(port), "--chain-id", "31337", "--hardfork", "cancun", "--silent")
	node.Stdout = os.Stderr
	node.Stderr = os.Stderr
	if e = node.Start(); e != nil {
		return e
	}
	defer stop(node)
	client, e := ethclient.DialContext(ctx, url)
	if e != nil {
		return e
	}
	defer client.Close()
	var chain *big.Int
	for i := 0; i < 100; i++ {
		if ctx.Err() != nil {
			return ctx.Err()
		}
		chain, e = client.ChainID(ctx)
		if e == nil {
			break
		}
		time.Sleep(50 * time.Millisecond)
	}
	if e != nil {
		return fmt.Errorf("owned Anvil readiness failed: %w", e)
	}
	if chain.Cmp(big.NewInt(31337)) != 0 {
		return fmt.Errorf("unexpected chain")
	}
	var info struct {
		HardFork string `json:"hardFork"`
	}
	if e = client.Client().CallContext(ctx, &info, "anvil_nodeInfo"); e != nil {
		return e
	}
	var clientVersion string
	if e = client.Client().CallContext(ctx, &clientVersion, "web3_clientVersion"); e != nil {
		return e
	}
	if !strings.EqualFold(info.HardFork, "cancun") || !strings.Contains(strings.ToLower(clientVersion), "anvil") {
		return fmt.Errorf("owned Cancun Anvil capability check failed")
	}
	// All mutable RPC calls follow owned-child, client, chain and fork checks.
	kinds := []string{"access"}
	token, e := deployToken(ctx, client, url)
	if e != nil {
		return e
	}
	for _, kind := range kinds {
		if e = transact(ctx, client, chain, kind, token); e != nil {
			return e
		}
	}
	return nil
}
func waitReceipt(ctx context.Context, c *ethclient.Client, hash common.Hash) (*types.Receipt, error) {
	for {
		receipt, e := c.TransactionReceipt(ctx, hash)
		if e == nil {
			return receipt, nil
		}
		if !errors.Is(e, ethereum.NotFound) {
			return nil, e
		}
		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(50 * time.Millisecond):
		}
	}
}
func transact(ctx context.Context, c *ethclient.Client, chain *big.Int, kind string, token common.Address) error {
	keyNumber := 1
	if kind == "access" || kind == "dynamic" {
		keyNumber = 2
	}
	key, e := crypto.HexToECDSA(fmt.Sprintf("%064x", keyNumber))
	if e != nil {
		return e
	}
	from := crypto.PubkeyToAddress(key.PublicKey)
	var ignored any
	if e = c.Client().CallContext(ctx, &ignored, "anvil_setBalance", from, hexutil.EncodeBig(new(big.Int).Mul(big.NewInt(100), big.NewInt(1e18)))); e != nil {
		return e
	}
	nonce, e := c.PendingNonceAt(ctx, from)
	if e != nil {
		return e
	}
	var to common.Address
	value := new(big.Int)
	var data []byte
	var signed *types.Transaction
	switch kind {
	case "access":
		to = token
		data = common.FromHex(articleTransfer)
		price, e := c.SuggestGasPrice(ctx)
		if e != nil {
			return e
		}
		msg := ethereum.CallMsg{From: from, To: &to, Data: data, GasPrice: price}
		var discovery struct {
			AccessList *types.AccessList `json:"accessList"`
			Error      string            `json:"error"`
		}
		call := map[string]any{"from": from, "to": to, "data": hexutil.Encode(data), "gasPrice": hexutil.EncodeBig(price)}
		if e = c.Client().CallContext(ctx, &discovery, "eth_createAccessList", call, "pending"); e != nil {
			return e
		}
		list := discovery.AccessList
		if discovery.Error != "" || list == nil || len(*list) == 0 {
			return fmt.Errorf("access list discovery failed: %s", discovery.Error)
		}
		msg.AccessList = *list
		gas, e := c.EstimateGas(ctx, msg)
		if e != nil {
			return e
		}
		signed, e = types.SignTx(types.NewTx(&types.AccessListTx{ChainID: chain, Nonce: nonce, GasPrice: price, Gas: gas, To: &to, Value: value, Data: data, AccessList: *list}), types.NewEIP2930Signer(chain), key)
		if e != nil {
			return e
		}

	default:
		return fmt.Errorf("unsupported article transaction type")
	}
	raw, e := signed.MarshalBinary()
	if e != nil {
		return e
	}
	var decoded types.Transaction
	if e = decoded.UnmarshalBinary(raw); e != nil {
		return e
	}
	signer := types.LatestSignerForChainID(chain)
	recovered, e := types.Sender(signer, &decoded)
	if e != nil || recovered != from || decoded.Nonce() != nonce {
		return fmt.Errorf("signed envelope recovery/nonce mismatch")
	}
	before, e := c.BalanceAt(ctx, to, nil)
	if e != nil {
		return e
	}
	var senderBefore, recipientBefore *big.Int
	if kind == "access" || kind == "dynamic" {
		senderBefore, e = tokenBalance(ctx, c, token, from)
		if e != nil {
			return e
		}
		recipientBefore, e = tokenBalance(ctx, c, token, common.HexToAddress(fixtureRecipient))
		if e != nil {
			return e
		}
	}

	if e = c.SendTransaction(ctx, signed); e != nil {
		return fmt.Errorf("local %s submission: %w", kind, e)
	}
	receipt, e := waitReceipt(ctx, c, signed.Hash())
	if e != nil {
		return e
	}
	if receipt.Status != 1 || receipt.Type != signed.Type() || receipt.TxHash != signed.Hash() || receipt.BlockNumber == nil || receipt.GasUsed == 0 {
		return fmt.Errorf("receipt status/type/identity mismatch")
	}
	observed, pending, e := c.TransactionByHash(ctx, signed.Hash())
	if e != nil {
		return e
	}
	if pending || observed.Hash() != signed.Hash() || !bytes.Equal(observed.Data(), data) || observed.To() == nil || *observed.To() != to || observed.Value().Cmp(value) != 0 {
		return fmt.Errorf("mined transaction fields mismatch")
	}
	afterNonce, e := c.PendingNonceAt(ctx, from)
	if e != nil || afterNonce != nonce+1 {
		return fmt.Errorf("sender nonce did not advance: %v", e)
	}
	after, e := c.BalanceAt(ctx, to, nil)
	if e != nil {
		return e
	}
	if value.Sign() > 0 && new(big.Int).Sub(after, before).Cmp(value) != 0 {
		return fmt.Errorf("recipient value delta mismatch")
	}
	if signed.Type() >= 2 && (receipt.EffectiveGasPrice == nil || receipt.EffectiveGasPrice.Cmp(signed.GasFeeCap()) > 0) {
		return fmt.Errorf("effective execution gas price exceeds cap")
	}
	if kind == "access" || kind == "dynamic" {
		senderAfter, e := tokenBalance(ctx, c, token, from)
		if e != nil {
			return e
		}
		recipientAfter, e := tokenBalance(ctx, c, token, common.HexToAddress(fixtureRecipient))
		if e != nil {
			return e
		}
		amount := big.NewInt(100000000000000000)
		if new(big.Int).Sub(senderBefore, senderAfter).Cmp(amount) != 0 || new(big.Int).Sub(recipientAfter, recipientBefore).Cmp(amount) != 0 {
			return fmt.Errorf("token transfer balance delta mismatch")
		}
		if len(receipt.Logs) != 1 {
			return fmt.Errorf("missing token transfer receipt log")
		}
		l := receipt.Logs[0]
		if l.Address != token || len(l.Topics) != 3 || l.Topics[0] != crypto.Keccak256Hash([]byte("Transfer(address,address,uint256)")) || l.Topics[1] != common.BytesToHash(from.Bytes()) || l.Topics[2] != common.BytesToHash(common.HexToAddress(fixtureRecipient).Bytes()) || !bytes.Equal(l.Data, common.LeftPadBytes(amount.Bytes(), 32)) {
			return fmt.Errorf("Transfer receipt fields mismatch")
		}
		if kind == "access" && len(observed.AccessList()) == 0 {
			return fmt.Errorf("mined type1 omitted discovered access list")
		}
	}

	fmt.Printf("local %s: tx=%s type=%d nonce=%d block=%s status=%d gasUsed=%d effects checked\n", kind, signed.Hash(), receipt.Type, nonce, receipt.BlockNumber, receipt.Status, receipt.GasUsed)
	return nil
}
func main() {
	execute := flag.Bool("execute-local", false, "start an owned Cancun Anvil; public NEVER-FUND fixtures only")
	flag.Parse()
	if flag.NArg() != 0 {
		fmt.Fprintln(os.Stderr, "No external RPC, wallet or extra arguments accepted")
		os.Exit(2)
	}
	if !*execute {
		fmt.Println("Plan only: owned Cancun Anvil → query → sign → submit → receipt/effect assertions. Use --execute-local; no public RPC or personal wallet.")
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

const fixtureRecipient = "0x8056361b1c1361436D61D187d761233b42d1c20e"
const articleTransfer = "0xa9059cbb0000000000000000000000008056361b1c1361436D61D187d761233b42d1c20e000000000000000000000000000000000000000000000000016345785D8A0000"

func tokenBalance(ctx context.Context, c *ethclient.Client, token, owner common.Address) (*big.Int, error) {
	data := append(crypto.Keccak256([]byte("balanceOf(address)"))[:4], common.LeftPadBytes(owner.Bytes(), 32)...)
	out, e := c.CallContract(ctx, ethereum.CallMsg{To: &token, Data: data}, nil)
	if e != nil {
		return nil, e
	}
	if len(out) != 32 {
		return nil, fmt.Errorf("invalid balance word")
	}
	return new(big.Int).SetBytes(out), nil
}
func deployToken(ctx context.Context, c *ethclient.Client, url string) (common.Address, error) {
	dir, e := os.Getwd()
	if e != nil {
		return common.Address{}, e
	}
	dir = filepath.Join(dir, "..", "local-token")
	command := exec.CommandContext(ctx, "forge", "create", "src/TokenFixture.sol:TokenFixture", "--broadcast", "--json", "--rpc-url", url, "--private-key", "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
	command.Dir = dir
	command.Stderr = os.Stderr
	out, e := command.Output()
	if e != nil {
		return common.Address{}, e
	}
	var result struct {
		DeployedTo string `json:"deployedTo"`
	}
	if e = json.Unmarshal(out, &result); e != nil {
		return common.Address{}, e
	}
	if !common.IsHexAddress(result.DeployedTo) {
		return common.Address{}, fmt.Errorf("missing deployed fixture address")
	}
	token := common.HexToAddress(result.DeployedTo)
	code, e := c.CodeAt(ctx, token, nil)
	if e != nil || len(code) == 0 {
		return token, fmt.Errorf("fixture runtime absent: %v", e)
	}
	inspect := exec.CommandContext(ctx, "forge", "inspect", "src/TokenFixture.sol:TokenFixture", "deployedBytecode")
	inspect.Dir = dir
	expected, e := inspect.Output()
	if e != nil {
		return token, e
	}
	if !bytes.Equal(code, common.FromHex(strings.TrimSpace(string(expected)))) {
		return token, fmt.Errorf("fixture runtime mismatch")
	}
	return token, nil
}
