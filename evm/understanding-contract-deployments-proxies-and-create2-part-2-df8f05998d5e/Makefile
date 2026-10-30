.DEFAULT_GOAL := test
.PHONY: setup build test

setup:
	@:

build: setup
	forge build --root factory
	forge build --root minimal-proxy
	forge build --root uups

test: setup
	forge test --root factory
	forge test --root minimal-proxy
	forge test --root uups
