# Dependency resolution used for the October 30 Mac runtime

These supplemental lockfiles record the offline dependency resolution used by
the temporary `borsh-profile` and `zero-copy` builds, whose preserved workspaces
did not supply Cargo.lock. They are build evidence, not recovered author files.
Other tested workspaces already include their original dependency locks.

The runtime summary records hashes and the SBF/host toolchains. No wallet,
program keypair, ledger or deployment artifact is retained here.
