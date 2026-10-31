// Supplemental article-local query → sign → submit → receipt reproduction.
// Only an owned loopback Anvil and public NEVER-FUND fixture keys are accepted.
package main

import (
	"bytes"
	"context"
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
	kinds := []string{"legacy"}

	for _, kind := range kinds {
		if e = transact(ctx, client, chain, kind); e != nil {
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
func transact(ctx context.Context, c *ethclient.Client, chain *big.Int, kind string) error {
	keyNumber := 1
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
	case "legacy":
		to = common.HexToAddress("0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF")
		value.SetInt64(10000000000000000)
		price, e := c.SuggestGasPrice(ctx)
		if e != nil {
			return e
		}
		signed, e = types.SignTx(types.NewTx(&types.LegacyTx{Nonce: nonce, GasPrice: price, Gas: 21000, To: &to, Value: value}), types.NewEIP155Signer(chain), key)
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
