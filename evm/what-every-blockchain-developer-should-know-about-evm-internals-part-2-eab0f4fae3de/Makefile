.DEFAULT_GOAL := test
.PHONY: setup build test

setup:
	@:

build: setup
	forge build --root calldata
	forge build --root storage
	forge build --root workshop

test: setup
	forge test --root calldata
	forge test --root storage
	forge test --root workshop
