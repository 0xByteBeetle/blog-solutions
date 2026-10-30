.PHONY: setup verify verify-evm verify-solana
setup:
	node scripts/setup-deps.mjs
verify:
	bash scripts/verify.sh
verify-evm:
	node scripts/verify-minimal.mjs --chain=evm
verify-solana:
	node scripts/verify-minimal.mjs --chain=solana
