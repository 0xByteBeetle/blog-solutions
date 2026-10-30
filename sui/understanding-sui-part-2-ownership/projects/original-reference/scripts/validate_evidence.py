"""Author-only checks against captured public receipts and native object reads."""

from datetime import datetime, timezone
import json
from pathlib import Path
import re
import subprocess


ROOT = Path(__file__).resolve().parents[1]
E = ROOT / "evidence/testnet"
ids = json.loads((E / "identities.json").read_text())
records = json.loads((E / "commands.json").read_text())
checks = []


def check(name, result):
    checks.append({"check": name, "passed": bool(result)})
    if not result:
        raise AssertionError(name)


def read(label):
    return json.loads((E / f"{label}.json").read_text())


def record(label):
    return next(r for r in reversed(records) if r["label"] == label)


chain = "69WiPg3DAQiwdxfncX6wYQ2siKwAe6L9BZthQea3JNMD"
check("public_testnet_chain", read("chain-id")["base58"] == chain == ids["chain_id"])
local_tests = 0
for module, count in (("owned", 2), ("registry", 2), ("rules", 1), ("case", 1), ("party_counter", 1)):
    r = record("test-" + module)
    output = r["stdout"] + r["stderr"]
    check("local_tests_" + module, r["exit_code"] == 0 and len(re.findall(r"\[ PASS\s*\]", output)) == count
          and f"Total tests: {count}; passed: {count}; failed: 0" in output)
    local_tests += count

positives = ["publish", "owned-create", "owned-alice-update", "owned-transfer", "cap-transfer", "owned-bob-update",
             "registry-create", "registry-alice-add", "registry-bob-add", "rules-create", "rules-bob-read",
             "case-pack", "case-update-inside", "case-unpack", "party-create", "party-update-a", "party-update-b"]
for label in positives:
    r, receipt = record(label), read(label)
    check("testnet_guard_" + label, r["network_guard"]["chain_id"] == chain)
    check("successful_execution_" + label, r["exit_code"] == 0 and receipt["effects"]["status"]["status"] == "success")
    check("automatic_gas_" + label, "--gas" not in r["argv"] and "--gas-coin" not in r["argv"]
          and receipt["transaction"]["data"]["gasData"]["payment"] == [])

negative_labels = ["owned-alice-rejected", "owned-bob-rejected", "registry-bob-reset-rejected",
                   "rules-bob-mutation-rejected", "wrapped-direct-update-rejected", "party-bob-rejected"]
for label in negative_labels:
    r = record(label)
    check("negative_testnet_guard_" + label, r["network_guard"]["chain_id"] == chain)
    check("expected_failure_" + label, r["exit_code"] == 1)
    check("negative_automatic_gas_" + label, "--gas" not in r["argv"] and "--gas-coin" not in r["argv"])

for label, key in (("owned-alice-rejected", "notebook"), ("owned-bob-rejected", "capability"), ("party-bob-rejected", "party")):
    r = record(label)
    output = r["stdout"] + r["stderr"]
    check("owner_admission_" + label, ids[key] in output and "not signed by the correct sender" in output
          and "Error executing transaction" not in output)

for label, cause in (("registry-failed-receipt", "MoveAbort"), ("rules-failed-receipt", "InvalidObjectByMutRef")):
    receipt = read(label)
    status = receipt["effects"]["status"]
    check("committed_failure_" + label, status["status"] == "failure" and cause in status["error"])
    check("failed_execution_automatic_gas_" + label, receipt["transaction"]["data"]["gasData"]["payment"] == [])

for label, identity in (("owned_before", "notebook"), ("owned", "notebook"), ("capability", "capability"),
                        ("shared", "registry"), ("immutable", "rules"), ("wrapped", "case"),
                        ("unwrapped", "notebook"), ("party", "party")):
    check("native_read_identity_" + label, read(label)["object"]["object_id"] == ids[identity])

owned_before, owned, capability, shared, immutable, wrapped, unwrapped, party = (
    read(label)["object"] for label in ("owned_before", "owned", "capability", "shared", "immutable", "wrapped", "unwrapped", "party")
)
check("initial_owner_and_value", owned_before["owner"]["address"] == ids["alice"] and owned_before["json"]["value"] == "9")
check("transferred_owner_and_value", owned["owner"]["address"] == ids["bob"] and owned["json"]["value"] == "11")
check("capability_binding", capability["owner"]["address"] == ids["bob"] and capability["json"]["notebook"] == ids["notebook"])
check("shared_state", shared["owner"]["kind"] == "SHARED" and shared["json"]["admin"] == ids["alice"] and shared["json"]["entries"] == "2")
check("immutable_state", immutable["owner"]["kind"] == "IMMUTABLE" and immutable["json"]["limit"] == "10")
check("wrapped_state", wrapped["owner"]["address"] == ids["bob"] and wrapped["json"]["notebook"]["id"] == ids["notebook"]
      and wrapped["json"]["notebook"]["value"] == "11")
check("wrapped_child_missing", read("wrapped_child")["error"]["code"] == "NOT_FOUND")
wrapped_rejection = record("wrapped-direct-update-rejected")
wrapped_output = wrapped_rejection["stdout"] + wrapped_rejection["stderr"]
check("wrapped_direct_lookup_rejected", ids["notebook"] in wrapped_output and "not found" in wrapped_output.lower())
check("unwrapped_identity_and_value", unwrapped["object_id"] == ids["notebook"] and unwrapped["owner"]["address"] == ids["bob"]
      and unwrapped["json"]["value"] == "12")
check("party_access_and_value", party["owner"]["kind"] == "CONSENSUS_ADDRESS" and party["owner"]["address"] == ids["alice"]
      and party["json"]["value"] == "2")
check("party_distinct_digests", read("party-update-a")["digest"] != read("party-update-b")["digest"])
check("party_both_launched_before_wait", record("party-update-a")["launched_before_wait"] and record("party-update-b")["launched_before_wait"])

selectors = [("publish", "package", ids["package"]), ("owned-create", "::owned::Notebook", ids["notebook"]),
             ("owned-create", "::owned::NotebookCap", ids["capability"]), ("registry-create", "::registry::Registry", ids["registry"]),
             ("rules-create", "::rules::Rules", ids["rules"]), ("case-pack", "::case::Case", ids["case"]),
             ("party-create", "::party_counter::Counter", ids["party"])]
for label, selector, expected in selectors:
    result = subprocess.run(["python3", "client/receipt.py", str(E / f"{label}.json"), selector], cwd=ROOT,
                            capture_output=True, text=True, check=True)
    check("receipt_selector_" + selector, result.stdout.strip() == expected)

result = {
    "validated_at": datetime.now(timezone.utc).isoformat(), "status": "passed", "network": "Sui Testnet",
    "chain_id": chain, "cli": record("version")["stdout"].strip(),
    "counts": {"local_move_tests": local_tests, "successful_signed_testnet_executions": len(positives),
               "persistent_failed_executions": 2, "input_owner_rejections": 3, "wrapped_lookup_rejections": 2,
               "successful_native_object_reads": 8, "receipt_selector_cases": len(selectors), "checks": len(checks)},
    "positive_execution_labels": positives, "expected_negative_mutation_labels": negative_labels,
    "observed_versions": {"shared": {"current": shared["version"], "start": shared["owner"]["version"]},
                          "case_when_wrapped": wrapped["version"], "unwrapped_notebook": unwrapped["version"],
                          "party": {"current": party["version"], "start": party["owner"]["version"]}},
    "checks": checks,
}
print(json.dumps({"status": result["status"], "counts": result["counts"], "observed_versions": result["observed_versions"]}, indent=2))
