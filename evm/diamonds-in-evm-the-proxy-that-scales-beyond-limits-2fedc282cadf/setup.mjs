// Supplemental dependency setup only; no blockchain activity.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.dirname(fileURLToPath(import.meta.url));
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(command + " failed (" + (result.signal || result.status) + "): " + result.stderr);
  return result.stdout.trim();
}
import fs from "node:fs";
const library = path.join(root, "diamond/.local/forge-std");
const expected = "620536fa5277db4e3fd46772d5cbc1ea0696fb43";
if (!fs.existsSync(library)) {
  fs.mkdirSync(path.dirname(library), { recursive: true });
  run("git", ["clone", "--branch", "v1.16.1", "--depth", "1", "https://github.com/foundry-rs/forge-std.git", library]);
}
if (fs.lstatSync(library).isSymbolicLink()) throw new Error("Refusing symlinked dependency");
if (run("git", ["rev-parse", "HEAD"], library) !== expected) {
  throw new Error("Unexpected forge-std revision; existing directory left untouched");
}
if (run("git", ["status", "--porcelain", "--untracked-files=all"], library)) {
  throw new Error("Modified forge-std tree; existing directory left untouched");
}
console.log("Verified forge-std v1.16.1 at " + expected);
