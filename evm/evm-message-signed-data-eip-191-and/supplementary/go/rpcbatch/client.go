package rpcbatch

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

type Request struct {
	JSONRPC string `json:"jsonrpc"`
	ID      int    `json:"id"`
	Method  string `json:"method"`
	Params  any    `json:"params"`
}

type Response struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      int             `json:"id"`
	Result  json.RawMessage `json:"result,omitempty"`
	Error   *RPCError       `json:"error,omitempty"`
}

type RPCError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func (err *RPCError) Error() string {
	return fmt.Sprintf("rpc error %d: %s", err.Code, err.Message)
}

func Call(ctx context.Context, client *http.Client, endpoint string, requests []Request) (map[int]json.RawMessage, error) {
	if len(requests) == 0 {
		return nil, errors.New("rpc batch is empty")
	}
	seen := make(map[int]struct{}, len(requests))
	for _, request := range requests {
		if request.ID == 0 {
			return nil, errors.New("rpc request ID must be non-zero")
		}
		if _, exists := seen[request.ID]; exists {
			return nil, fmt.Errorf("duplicate rpc request ID %d", request.ID)
		}
		seen[request.ID] = struct{}{}
	}

	payload, err := json.Marshal(requests)
	if err != nil {
		return nil, err
	}
	httpRequest, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	httpRequest.Header.Set("Content-Type", "application/json")
	response, err := client.Do(httpRequest)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("rpc returned HTTP %d", response.StatusCode)
	}

	var replies []Response
	if err := json.NewDecoder(response.Body).Decode(&replies); err != nil {
		return nil, err
	}
	results := make(map[int]json.RawMessage, len(replies))
	for _, reply := range replies {
		if reply.Error != nil {
			return nil, reply.Error
		}
		if _, expected := seen[reply.ID]; !expected {
			return nil, fmt.Errorf("unexpected rpc response ID %d", reply.ID)
		}
		results[reply.ID] = reply.Result
	}
	if len(results) != len(requests) {
		return nil, fmt.Errorf("received %d of %d rpc responses", len(results), len(requests))
	}
	return results, nil
}
