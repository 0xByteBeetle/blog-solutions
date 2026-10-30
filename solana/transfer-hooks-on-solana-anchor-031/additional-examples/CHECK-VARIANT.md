# Explicit CHECK-documentation variant — not runtime-verified

The exact printed transfer-hook block7 has two `AccountInfo` initialization fields
without CHECK documentation: `extra_metas_account` and `mint`. The healthy recovered
original repository already documents these with `/// CHECK: PDA for extra metas`
and `/// CHECK: Mint`. This variant copies precisely those two comments into the
already typography-normalized printed workspace source; it changes no field,
constraint, account layout, instruction logic or error name. The original printed
snapshot and original repository implementation are untouched.

`variants/check-annotations/lib.rs` is the actual supplemental variant, not merely
instructions. `CHECK-VARIANT.json` records its hash and exact base hash. The test
removes only the two exact inserted comment lines and requires byte equality with
the base. The runner repeats that check before selecting the variant. It is used
**only** with `--check-annotations` and has separately named evidence output.

From the containing `additional-examples` companion:

```sh
node --test tests/check-annotations.test.mjs
# Only after runtime/keygen authorization and article-local dependency setup:
node scripts/run-local.mjs --execute-local --build-only --check-annotations
node scripts/run-local.mjs --execute-local --regression --check-annotations
```

Even build-only uses disposable signing keys in the inherited harness. Do not run
these while another validator owns the fixed local ports. Ordinary runs without
`--check-annotations` continue selecting the unchanged printed workspace. The
already-tested recovered original variant remains separate and available.

**Static: 2 regression checks + Node syntax PASS. Runtime: NOT RUN.** Missing
comments are a demonstrated source difference, not a claimed observed compiler
failure in this workspace. Whether this resolves a lint gate on the installed
Anchor0.31.1 toolchain still requires the Mac build. CHECK documentation is not
runtime account validation or a new security guarantee; these accounts retain the
same program constraints as the printed example.
