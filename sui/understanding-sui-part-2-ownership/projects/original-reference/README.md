# Historical Ownership code and essential captured fixtures

This selected subset comes from branch commit
`432209b5b8e592631e3931b5e9ed5a9b38aef3bb`. All 155 files named by the original
`provenance.json` field `source_and_evidence_files` are preserved byte-for-byte.
The current captured Testnet receipts and native reads support the offline
validator, not a new chain execution. Run only:

```sh
python3 scripts/validate_evidence.py
```

The 109 fixture-consistency/receipt-selection checks were rerun offline. They
verify historical files; no fresh Move compile, network read or transaction is
claimed. Older localnet/explicit-gas archives, redundant screenshots and their
old narrative README are deliberately omitted. The unchanged provenance file
still records where those historical archives existed in the source branch;
see IMPORT-SCOPE.json. They are not dependencies of this offline validator.

Use ../current-draft for the current exact native snippets and supplemental
setup/tests. Do not execute historical public-network transaction commands as
a default reproduction route. No wallet, keypair, node database or build output
is included. This README is supplemental import guidance, not author source.
