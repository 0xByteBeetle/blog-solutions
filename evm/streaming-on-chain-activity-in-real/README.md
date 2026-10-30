# Streaming On-Chain Activity in Real Time

[Read the article](https://andreyobruchkov1996.substack.com/p/streaming-on-chain-activity-in-real).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

### .

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
# From this article directory
go test ./...
```

The original executable contains a network endpoint. Compile/tests do not authorize running it against a public chain; inspect the endpoint and use local/mocked execution.
