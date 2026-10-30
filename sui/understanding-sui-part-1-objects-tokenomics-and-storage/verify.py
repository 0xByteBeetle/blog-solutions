"""Build and test the Move companion locally, including its intentional failure."""

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
from pathlib import Path
from local_cli import environment, assert_keyless


root = Path(__file__).resolve().parent
config = json.loads((root / "toolchain.json").read_text())
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--sui", type=Path, help="Use an existing Sui CLI executable")
args = parser.parse_args()
binary_name = "sui.exe" if os.name == "nt" else "sui"
local_cli = root / ".tools" / "bin" / binary_name
candidate = args.sui or (local_cli if local_cli.is_file() else shutil.which("sui"))
if candidate is None:
    raise SystemExit("Provide an existing Sui 1.82.3 executable with --sui /absolute/path/to/sui")
cli = str(Path(candidate).resolve())
output_dir = root / "evidence" / "local"
output_dir.mkdir(parents=True, exist_ok=True)
runs = []
cli_environment = environment()


def run(name, arguments, cwd):
    result = subprocess.run([cli, *arguments], cwd=cwd, env=cli_environment, capture_output=True, text=True)
    assert_keyless()
    (output_dir / (name + ".stdout.txt")).write_text(result.stdout)
    (output_dir / (name + ".stderr.txt")).write_text(result.stderr)
    record = {"command": ["sui", *arguments], "working_directory": str(cwd.relative_to(root)), "exit_code": result.returncode}
    runs.append(record)
    print(" ".join(record["command"]), "->", result.returncode, flush=True)
    return result


version = run("version", ["--version"], root)
match = re.search(r"\bsui\s+(\d+\.\d+\.\d+)(?:\D|$)", version.stdout)
if version.returncode or not match or match.group(1) != config["sui_version"]:
    raise SystemExit("Expected Sui " + config["sui_version"] + ". See evidence/local/version.*.txt")

package = root
build = run("build", ["move", "build"], package)
if build.returncode:
    raise SystemExit("Valid package did not build. See evidence/local/build.*.txt")
artifacts = list((package / "build").glob("*/bytecode_modules/notebook.mv"))
if len(artifacts) != 1 or artifacts[0].stat().st_size == 0:
    raise SystemExit("Expected one nonempty compiled notebook.mv artifact")
artifact = artifacts[0]
artifact_record = {
    "path": str(artifact.relative_to(root)),
    "bytes": artifact.stat().st_size,
    "sha256": hashlib.sha256(artifact.read_bytes()).hexdigest(),
}
print("Compiled artifact:", artifact_record["path"], artifact_record["bytes"], "bytes", flush=True)

tests = run("test", ["move", "test"], package)
test_text = tests.stdout + tests.stderr
summary = re.search(r"Test result: OK\. Total tests:\s*(\d+); passed:\s*(\d+); failed:\s*(\d+)", test_text)
if tests.returncode or not summary:
    raise SystemExit("Move tests did not pass. See evidence/local/test.*.txt")
total, passed, failed = map(int, summary.groups())
if total < 1 or total != passed or failed != 0:
    raise SystemExit("The test summary did not report a complete passing suite")
expected_names = ["test_create_and_update", "test_distinct_ids", "test_wrong_capability"]
if not all(re.search(r"\[\s*PASS\s*\].*::" + re.escape(name) + r"(?:\s|$)", test_text) for name in expected_names):
    raise SystemExit("The three expected foundation tests were not all reported as passing")

negative = run("cannot-copy", ["move", "build", "--path", "negative/copy_object"], package)
diagnostic = negative.stdout + negative.stderr
copy_rule = (
    negative.returncode != 0
    and "bad_copy.move" in diagnostic
    and "copy" in diagnostic.lower()
    and re.search(r"abilit(?:y|ies)", diagnostic, re.IGNORECASE) is not None
)
if not copy_rule:
    raise SystemExit("The invalid fixture was not rejected for the intended copy rule. See evidence/local/cannot-copy.*.txt")

report = {
    "scope": "Local compilation and Move unit tests only",
    "cli": version.stdout.strip(),
    "artifact": artifact_record,
    "tests": {"total": total, "passed": passed, "failed": failed},
    "expected_test_names": expected_names,
    "intentional_copy_failure_observed": True,
    "chain_reads": False,
    "package_publications": False,
    "transaction_submissions": False,
    "signing_keys": 0,
    "runs": runs,
}
(output_dir / "verification.json").write_text(json.dumps(report, indent=2) + "\n")
print("PASS: build, local tests, artifact, and intended compiler rejection")
print("No chain read, key creation, package publication, or transaction submission")
