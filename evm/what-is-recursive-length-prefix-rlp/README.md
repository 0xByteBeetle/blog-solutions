# What is Recursive-length prefix (RLP) serialization

[Read the article](https://andreyobruchkov1996.substack.com/p/what-is-recursive-length-prefix-rlp).

The article code is preserved; build configuration and focused tests are supplemental. Run commands from this folder.

### rlp

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd rlp
go test ./...
```

### corrected

Go 1.23.10 or compatible. Dependencies are pinned by go.mod/go.sum.

```sh
cd corrected
go test ./...
```

`rlp/` is the article implementation. `corrected/` separately tests consumed-length and conversion bounds; originals remain unchanged.
