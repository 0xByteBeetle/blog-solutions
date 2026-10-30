package main

import (
	"context"
	"fmt"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"io"
	"log"
	"os"
)

func main() {
	client, err := ethclient.Dial("wss://polygon-amoy-bor-rpc.publicnode.com")
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()
	if err := stream(context.Background(), client, os.Stdout); err != nil {
		log.Fatal(err)
	}
}

// Supplemental cancellation/output seams let tests exercise the article's real subscription loop.
func stream(ctx context.Context, client *ethclient.Client, out io.Writer) error {
	transferSig := common.HexToHash("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef")
	query := ethereum.FilterQuery{
		Addresses: []common.Address{common.HexToAddress("0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904")},
		Topics:    [][]common.Hash{{transferSig}, {common.HexToHash("0x0000000000000000000000007f8b1ca29f95274e06367b60fc4a539e4910fd0c")}},
	}
	logs := make(chan types.Log)
	sub, err := client.SubscribeFilterLogs(ctx, query, logs)
	if err != nil {
		return err
	}
	defer sub.Unsubscribe()
	fmt.Fprintln(out, "Listening for Transfer events...")
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case err := <-sub.Err():
			return err
		case event := <-logs:
			fmt.Fprintf(out, "New Transfer log in block %d, tx %s\n", event.BlockNumber, event.TxHash.Hex())
			fmt.Fprintln(out, "Raw topics:", event.Topics)
			fmt.Fprintln(out, "Data:", event.Data)
		}
	}
}
