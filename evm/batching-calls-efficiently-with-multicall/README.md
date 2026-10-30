# Multicall: three ERC20 reads in one eth_call

Companion to [Batching Calls Efficiently with Multicall and RPC batch](https://andreyobruchkov1996.substack.com/p/batching-calls-efficiently-with-multicall).

`main.go` is unchanged article code. The existing article-local `go.mod` and `go.sum` retain go-ethereum 1.16.1 and its locked dependencies. Tests are supplemental.

Requires Go 1.23.10 or newer. From this directory:

```sh
go test -v ./...
go vet ./...
go build .
```

Dependencies may be downloaded on first use; with them cached, prefix commands with `GOPROXY=off` for offline resolution. Tests use an owned loopback HTTP mock, not a blockchain, wallet, or public RPC.

The tests run the unchanged main against deterministic ABI responses, check one eth_call containing balanceOf/symbol/decimals for the intended addresses, and exercise both success and failed-symbol responses. A separate test rejects truncated ABI return data. Failed symbol prints an empty symbol as in the original code; this is preserved, not silently repaired.

**Do not run `go run .` as an offline test.** The original main defaults to a public Polygon Amoy RPC and historical token/address fixtures. That path is read-only eth_call, but endpoint availability and live contract contents were not verified. No public-network execution was performed.

Verified with Go 1.24.13: tests, vet and build.
