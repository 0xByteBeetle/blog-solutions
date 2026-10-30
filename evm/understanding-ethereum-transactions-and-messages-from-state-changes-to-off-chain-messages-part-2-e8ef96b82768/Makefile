.DEFAULT_GOAL := test
.PHONY: setup build test

setup:
	node setup.mjs

build: setup
	forge build --root delegation
	forge build --root permit-verifier

test: setup
	forge test --root delegation
	forge test --root permit-verifier
