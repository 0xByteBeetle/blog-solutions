package rpcbatch

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestBatchResponsesAreMatchedByIDNotArrayPosition(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		var calls []Request
		if err := json.NewDecoder(request.Body).Decode(&calls); err != nil {
			t.Fatal(err)
		}
		if len(calls) != 2 {
			t.Fatalf("got %d calls", len(calls))
		}
		writer.Header().Set("Content-Type", "application/json")
		_, _ = writer.Write([]byte(`[
			{"jsonrpc":"2.0","id":2,"result":"0x12"},
			{"jsonrpc":"2.0","id":1,"result":"0xLINK"}
		]`))
	}))
	defer server.Close()

	results, err := Call(context.Background(), server.Client(), server.URL, []Request{
		{JSONRPC: "2.0", ID: 1, Method: "eth_call", Params: []any{}},
		{JSONRPC: "2.0", ID: 2, Method: "eth_call", Params: []any{}},
	})
	if err != nil {
		t.Fatal(err)
	}
	if string(results[1]) != `"0xLINK"` || string(results[2]) != `"0x12"` {
		t.Fatalf("unexpected results: %v", results)
	}
}

func TestBatchSurfacesRPCError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Content-Type", "application/json")
		_, _ = writer.Write([]byte(`[{"jsonrpc":"2.0","id":1,"error":{"code":-32000,"message":"execution reverted"}}]`))
	}))
	defer server.Close()

	_, err := Call(context.Background(), server.Client(), server.URL, []Request{
		{JSONRPC: "2.0", ID: 1, Method: "eth_call", Params: []any{}},
	})
	if err == nil {
		t.Fatal("expected rpc error")
	}
}
