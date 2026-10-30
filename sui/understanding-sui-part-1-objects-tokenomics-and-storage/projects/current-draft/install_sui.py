"""Install only the pinned official Sui CLI into this companion's .tools folder."""

import argparse
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
from local_cli import environment, assert_keyless


root = Path(__file__).resolve().parent
config = json.loads((root / "toolchain.json").read_text())
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--archive", type=Path, help="Reuse an already downloaded official archive")
args = parser.parse_args()

system = platform.system()
machine = platform.machine().lower()
systems = {"Darwin": "macos", "Linux": "ubuntu", "Windows": "windows"}
machines = {"arm64": "arm64", "aarch64": "arm64", "x86_64": "x86_64", "amd64": "x86_64"}
if system not in systems or machine not in machines:
    raise SystemExit("Unsupported platform. Install the pinned release from " + config["release_url"])
architecture = machines[machine]
if system == "Linux" and architecture == "arm64":
    architecture = "aarch64"
asset_key = systems[system] + "-" + architecture
if asset_key not in config["assets"]:
    raise SystemExit("No pinned archive for " + asset_key)
asset = config["assets"][asset_key]
tools = root / ".tools"
tools.mkdir(exist_ok=True)
archive = args.archive.resolve() if args.archive else tools / asset["url"].rsplit("/", 1)[1]

if not archive.exists():
    if args.archive:
        raise SystemExit("The supplied archive does not exist")
    request = Request(asset["url"], headers={"User-Agent": "0xByteBeetle-Sui-Lab"})
    ca_file = "/etc/ssl/cert.pem" if Path("/etc/ssl/cert.pem").is_file() else None
    context = ssl.create_default_context(cafile=ca_file)
    temporary = archive.with_suffix(archive.suffix + ".part")
    print("Downloading", asset["url"], flush=True)
    try:
        with urlopen(request, timeout=60, context=context) as response:
            with temporary.open("wb") as output:
                shutil.copyfileobj(response, output)
        temporary.replace(archive)
    finally:
        temporary.unlink(missing_ok=True)

digest = hashlib.sha256()
with archive.open("rb") as handle:
    for chunk in iter(lambda: handle.read(1024 * 1024), b""):
        digest.update(chunk)
if digest.hexdigest() != asset["sha256"]:
    raise SystemExit("Archive SHA-256 mismatch. The CLI was not installed")
print("Verified archive SHA-256:", digest.hexdigest())

binary_name = "sui.exe" if system == "Windows" else "sui"
destination = tools / "bin" / binary_name
destination.parent.mkdir(exist_ok=True)
temporary_binary = destination.with_suffix(".pending")
with tarfile.open(archive, "r:gz") as bundle:
    matches = [member for member in bundle.getmembers() if member.isfile() and Path(member.name).name == binary_name]
    if len(matches) != 1:
        raise SystemExit("The archive did not contain exactly one Sui CLI binary")
    source = bundle.extractfile(matches[0])
    if source is None:
        raise SystemExit("The CLI binary could not be read")
    with source, temporary_binary.open("wb") as output:
        shutil.copyfileobj(source, output)
os.chmod(temporary_binary, 0o755)
temporary_binary.replace(destination)
result = subprocess.run([str(destination), "--version"], env=environment(), text=True, capture_output=True, check=True)
assert_keyless()
print(result.stdout.strip())
if config["sui_version"] not in result.stdout:
    raise SystemExit("The extracted CLI did not report the pinned version")
print("Installed locally:", destination.relative_to(root))
