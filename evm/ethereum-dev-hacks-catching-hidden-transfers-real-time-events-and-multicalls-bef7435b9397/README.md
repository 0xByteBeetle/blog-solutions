# Ethereum Dev Hacks: Catching Hidden Transfers, Real-Time Events, and Multicalls

[Read the article](https://andreyobruchkov1996.substack.com/p/ethereum-dev-hacks-catching-hidden-transfers-real-time-events-and-multicalls-bef7435b9397).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

### multicall

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd multicall
go test ./...
```

The original executable contains a network endpoint. Compile/tests do not authorize running it against a public chain; inspect the endpoint and use local/mocked execution.

### streaming

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd streaming
go test ./...
```

The original executable contains a network endpoint. Compile/tests do not authorize running it against a public chain; inspect the endpoint and use local/mocked execution.
