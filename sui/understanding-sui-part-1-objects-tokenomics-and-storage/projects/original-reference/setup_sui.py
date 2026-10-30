import hashlib
import json
import os
import platform
import shutil
import ssl
import subprocess
import tarfile
from pathlib import Path
from urllib.request import Request, urlopen

release = "mainnet-v1.82.3"
checksums = {
    "macos-arm64": "861f8833c5c7008c86aca50e925043baa8e04332dcbd846cc6c31ea0eee16be9",
    "macos-x86_64": "ea174560d3a6a99d388f06219045d11db7eaba8287f9b840dc016af76635fac5",
    "ubuntu-aarch64": "1946a62d579b1c1fe8725d4c5c22b3d75ee0312a97ccc726e54dec8f966bc0e6",
    "ubuntu-x86_64": "d616d63d90309926cf7f544633c8dd4132f762fdbba555a35c4842cfa4129379",
    "windows-x86_64": "d9d7c6887ff44f3ee957b87ab506669bab6aaa638f491cf2a9024ae720edaf8a",
}
root = Path(__file__).resolve().parent
system = platform.system()
machine = platform.machine().lower()
systems = {"Darwin": "macos", "Linux": "ubuntu", "Windows": "windows"}
machines = {"arm64": "arm64", "aarch64": "arm64", "x86_64": "x86_64", "amd64": "x86_64"}
if system not in systems or machine not in machines:
    raise SystemExit("This example supports macOS, Ubuntu, and Windows on the listed architectures")
architecture = machines[machine]
if system == "Linux" and architecture == "arm64":
    architecture = "aarch64"
asset = systems[system] + "-" + architecture
if asset not in checksums:
    raise SystemExit("No pinned release asset for " + asset)

for directory in (".tools/bin", ".local/sui-config", ".local/move-cache",
                  "move/sources", "move/tests", "move/negative/copy_object/sources",
                  "client", "evidence"):
    (root / directory).mkdir(parents=True, exist_ok=True)
config_dir = root / ".local/sui-config"
keystore = config_dir / "sui.keystore"
if keystore.exists() and json.loads(keystore.read_text()) != []:
    raise SystemExit("Refusing to replace a keystore that contains signing material")
keystore.write_text("[]\n")
keystore.chmod(0o600)
client = (
    "keystore:\n  File: " + json.dumps(str(keystore)) + "\n"
    "active_address: null\nactive_env: testnet\n"
    "envs:\n  - alias: testnet\n"
    "    rpc: https://fullnode.testnet.sui.io:443\n"
    "    ws: null\n    basic_auth: null\n"
)
(config_dir / "client.yaml").write_text(client)
env = os.environ.copy()
env.update(SUI_CONFIG_DIR=str(config_dir), MOVE_HOME=str(root / ".local/move-cache"), NO_COLOR="1")

filename = f"sui-{release}-{asset}.tgz"
archive = root / ".tools" / filename
if not archive.is_file():
    url = f"https://github.com/MystenLabs/sui/releases/download/{release}/{filename}"
    ca_file = "/etc/ssl/cert.pem" if Path("/etc/ssl/cert.pem").is_file() else None
    context = ssl.create_default_context(cafile=ca_file)
    request = Request(url, headers={"User-Agent": "0xByteBeetle-Sui-Foundations"})
    temporary = archive.with_suffix(".part")
    try:
        with urlopen(request, context=context, timeout=90) as response:
            with temporary.open("wb") as output:
                shutil.copyfileobj(response, output)
        temporary.replace(archive)
    finally:
        temporary.unlink(missing_ok=True)
digest = hashlib.sha256()
with archive.open("rb") as handle:
    for chunk in iter(lambda: handle.read(1024 * 1024), b""):
        digest.update(chunk)
if digest.hexdigest() != checksums[asset]:
    raise SystemExit("Archive checksum mismatch. The CLI was not executed")

binary_name = "sui.exe" if system == "Windows" else "sui"
binary = root / ".tools/bin" / binary_name
with tarfile.open(archive, "r:gz") as bundle:
    matches = [entry for entry in bundle.getmembers()
               if entry.isfile() and Path(entry.name).name == binary_name]
    if len(matches) != 1:
        raise SystemExit("Expected exactly one CLI binary in the official archive")
    source = bundle.extractfile(matches[0])
    if source is None:
        raise SystemExit("The CLI binary could not be read")
    pending = binary.with_suffix(".pending")
    with source, pending.open("wb") as output:
        shutil.copyfileobj(source, output)
pending.chmod(0o755)
pending.replace(binary)
result = subprocess.run([str(binary), "--version"], env=env, text=True,
                        capture_output=True, check=True)
version = result.stdout.strip()
if version.split()[1].split("-")[0] != "1.82.3":
    raise SystemExit("The CLI did not report the pinned version")
if json.loads(keystore.read_text()) != []:
    raise SystemExit("The setup configuration unexpectedly contains signing keys")
print("Platform:", asset)
print("Verified archive SHA-256:", digest.hexdigest())
print(version)
print("Installed CLI:", binary.relative_to(root))
print("Keyless configuration: .local/sui-config")
print("Move cache: .local/move-cache")
print("Signing keys: 0")
print("Created directories: move/sources, move/tests, move/negative/copy_object/sources, client, evidence")
