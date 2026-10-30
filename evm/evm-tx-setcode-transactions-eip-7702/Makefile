.DEFAULT_GOAL := test
.PHONY: setup build test

setup:
	@:

build: setup
	forge build --root delegation

test: setup
	forge test --root delegation
