.PHONY: setup verify verify-evm verify-solana verify-local

setup:
	./scripts/setup.sh

verify:
	./scripts/verify.sh

verify-evm:
	./scripts/verify-evm.sh

verify-solana:
	./scripts/verify-solana.sh

verify-local:
	./scripts/verify-local-chains.sh
