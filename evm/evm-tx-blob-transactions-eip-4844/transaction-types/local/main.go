// Supplemental article-local query → sign → submit → receipt reproduction.
// Only an owned loopback Anvil and public NEVER-FUND fixture keys are accepted.
package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"errors"
	"flag"
	"fmt"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/crypto/kzg4844"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/holiman/uint256"
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
	kinds := []string{"blob"}

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
	case "blob":
		to = common.HexToAddress("0x7F8b1ca29F95274E06367b60fC4a539E4910FD0c")
		value.SetInt64(100000000000000)
		if e = kzg4844.UseCKZG(false); e != nil {
			return e
		}
		// Canonical field-element packing is supplemental; decoded text equals the article literal.
		content := []byte("Hello, EIP-4844 Blob Transaction on Sepolia! This is some arbitrary data for the blob payload.")
		var payload kzg4844.Blob
		var recoveredText []byte
		for offset := 0; offset < len(content); offset += 31 {
			end := offset + 31
			if end > len(content) {
				end = len(content)
			}
			slot := (offset / 31) * 32
			copy(payload[slot+1:slot+32], content[offset:end])
			recoveredText = append(recoveredText, payload[slot+1:slot+1+end-offset]...)
		}
		if !bytes.Equal(content, recoveredText) {
			return fmt.Errorf("blob payload text mismatch")
		}
		commitment, e := kzg4844.BlobToCommitment(&payload)
		if e != nil {
			return e
		}
		proof, e := kzg4844.ComputeBlobProof(&payload, commitment)
		if e != nil {
			return e
		}
		if e = kzg4844.VerifyBlobProof(&payload, commitment, proof); e != nil {
			return e
		}
		hash := common.Hash(kzg4844.CalcBlobHashV1(sha256.New(), &commitment))
		sidecar := &types.BlobTxSidecar{Blobs: []kzg4844.Blob{payload}, Commitments: []kzg4844.Commitment{commitment}, Proofs: []kzg4844.Proof{proof}}
		tip, cap, e := feeCaps(ctx, c)
		if e != nil {
			return e
		}
		gas, e := c.EstimateGas(ctx, ethereum.CallMsg{From: from, To: &to, Value: value, GasTipCap: tip, GasFeeCap: cap, BlobGasFeeCap: big.NewInt(2000000), BlobHashes: []common.Hash{hash}})
		if e != nil {
			return e
		}
		signed, e = types.SignTx(types.NewTx(&types.BlobTx{ChainID: uint256.MustFromBig(chain), Nonce: nonce, GasTipCap: uint256.MustFromBig(tip), GasFeeCap: uint256.MustFromBig(cap), Gas: gas, To: to, Value: uint256.MustFromBig(value), BlobFeeCap: uint256.NewInt(2000000), BlobHashes: []common.Hash{hash}, Sidecar: sidecar}), types.LatestSignerForChainID(chain), key)
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

	if receipt.BlobGasUsed != 131072 || receipt.BlobGasPrice == nil || receipt.BlobGasPrice.Sign() <= 0 || receipt.BlobGasPrice.Cmp(signed.BlobGasFeeCap()) > 0 || len(observed.BlobHashes()) != 1 || observed.BlobHashes()[0] != signed.BlobHashes()[0] {
		return fmt.Errorf("blob receipt gas/price/hash mismatch")
	}

	fmt.Printf("local %s: tx=%s type=%d nonce=%d block=%s status=%d gasUsed=%d blobGasUsed=%d blobGasPrice=%s\n", kind, signed.Hash(), receipt.Type, nonce, receipt.BlockNumber, receipt.Status, receipt.GasUsed, receipt.BlobGasUsed, receipt.BlobGasPrice)
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

func feeCaps(ctx context.Context, c *ethclient.Client) (*big.Int, *big.Int, error) {
	history, e := c.FeeHistory(ctx, 5, nil, []float64{})
	if e != nil {
		return nil, nil, e
	}
	if len(history.BaseFee) == 0 {
		return nil, nil, fmt.Errorf("fee history omitted base fee")
	}
	tip, e := c.SuggestGasTipCap(ctx)
	if e != nil {
		return nil, nil, e
	}
	cap := new(big.Int).Mul(history.BaseFee[len(history.BaseFee)-1], big.NewInt(112))
	cap.Div(cap, big.NewInt(100))
	cap.Add(cap, tip)
	return tip, cap, nil
}
