.DEFAULT_GOAL := test
.PHONY: setup build test

setup:
	node setup.mjs

build: setup
	forge build --root diamond
	forge build --root workshop

test: setup
	forge test --root diamond
	forge test --root workshop
