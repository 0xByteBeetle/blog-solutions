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
run("npm", ["ci", "--ignore-scripts"]);
console.log("Installed locked OpenZeppelin dependency without lifecycle scripts");
