.DEFAULT_GOAL := test
.PHONY: setup build test

setup:
	@:

build: setup
	forge build --root storage-validation
	forge build --root transparent-proxy

test: setup
	forge test --root storage-validation
	forge test --root transparent-proxy
