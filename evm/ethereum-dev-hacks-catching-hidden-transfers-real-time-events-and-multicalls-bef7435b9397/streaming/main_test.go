package main

import (
	"context"
	"errors"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/ethereum/go-ethereum/rpc"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"
)

type logAPI struct{ query chan map[string]interface{} }

func (api *logAPI) Logs(ctx context.Context, query map[string]interface{}) (*rpc.Subscription, error) {
	notifier, ok := rpc.NotifierFromContext(ctx)
	if !ok {
		return nil, errors.New("subscription transport required")
	}
	sub := notifier.CreateSubscription()
	api.query <- query
	go func() {
		event := types.Log{Address: common.HexToAddress("0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904"), BlockNumber: 25356396, TxHash: common.HexToHash("0x1234"), Data: common.LeftPadBytes([]byte{42}, 32), Topics: []common.Hash{common.HexToHash("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef")}}
		notifier.Notify(sub.ID, event)
	}()
	return sub, nil
}

type capture struct {
	sync.Mutex
	text strings.Builder
	done chan struct{}
	once sync.Once
}

func (c *capture) Write(p []byte) (int, error) {
	c.Lock()
	defer c.Unlock()
	n, _ := c.text.Write(p)
	if strings.Contains(c.text.String(), "Data:") {
		c.once.Do(func() { close(c.done) })
	}
	return n, nil
}
func TestSubscriptionFilterAndDeliveredLog(t *testing.T) {
	api := &logAPI{query: make(chan map[string]interface{}, 1)}
	server := rpc.NewServer()
	if err := server.RegisterName("eth", api); err != nil {
		t.Fatal(err)
	}
	httpServer := httptest.NewServer(server.WebsocketHandler([]string{"*"}))
	defer httpServer.Close()
	defer server.Stop()
	client, err := ethclient.Dial("ws" + strings.TrimPrefix(httpServer.URL, "http"))
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	output := &capture{done: make(chan struct{})}
	result := make(chan error, 1)
	go func() { result <- stream(ctx, client, output) }()
	select {
	case <-output.done:
	case <-ctx.Done():
		t.Fatal("no event delivered")
	}
	query := <-api.query
	addresses := query["address"].([]interface{})
	topics := query["topics"].([]interface{})
	if len(addresses) != 1 || addresses[0].(string) != "0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904" || len(topics) != 2 {
		t.Fatal("wrong filter", query)
	}
	if topics[1].([]interface{})[0].(string) != "0x0000000000000000000000007f8b1ca29f95274e06367b60fc4a539e4910fd0c" {
		t.Fatal("wrong sender topic")
	}
	cancel()
	if err := <-result; !errors.Is(err, context.Canceled) {
		t.Fatal(err)
	}
	output.Lock()
	defer output.Unlock()
	if !strings.Contains(output.text.String(), "New Transfer log in block 25356396") || !strings.Contains(output.text.String(), "42]") {
		t.Fatal(output.text.String())
	}
}
func TestSubscriptionFailureReturns(t *testing.T) {
	server := rpc.NewServer()
	httpServer := httptest.NewServer(server.WebsocketHandler([]string{"*"}))
	defer httpServer.Close()
	defer server.Stop()
	client, err := ethclient.Dial("ws" + strings.TrimPrefix(httpServer.URL, "http"))
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	if err := stream(context.Background(), client, &strings.Builder{}); err == nil {
		t.Fatal("missing subscription method accepted")
	}
}
