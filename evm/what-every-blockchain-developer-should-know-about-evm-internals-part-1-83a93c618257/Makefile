.DEFAULT_GOAL := test
.PHONY: setup build test

setup:
	@:

build: setup
	forge build --root bytecode
	forge build --root workshop

test: setup
	forge test --root bytecode
	forge test --root workshop
