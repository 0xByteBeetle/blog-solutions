.DEFAULT_GOAL := test
.PHONY: setup build test

setup:
	@:

build: setup
	forge build --root corrected
	forge build --root uups

test: setup
	forge test --root corrected
	forge test --root uups
