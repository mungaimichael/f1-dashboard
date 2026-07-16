// Re-applies `adb reverse tcp:4000 tcp:4000` to every connected Android
// target (emulators and physical devices). Reverse forwards are dropped
// whenever a device reconnects or the adb server restarts, so this runs
// before `cap run android` to make localhost:4000 reachable again.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const PORT = process.env.BACKEND_PORT ?? "4000";

function findAdb() {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    join(homedir(), "Library/Android/sdk")
  ]
    .filter(Boolean)
    .map((sdk) => join(sdk, "platform-tools/adb"));

  const found = candidates.find((p) => existsSync(p));
  if (found) return found;

  // Fall back to PATH resolution; execFileSync will throw if absent.
  return "adb";
}

const adb = findAdb();

const deviceLines = execFileSync(adb, ["devices"], { encoding: "utf8" })
  .split("\n")
  .slice(1)
  .map((line) => line.trim())
  .filter((line) => line.endsWith("device"));

if (deviceLines.length === 0) {
  console.warn("adb-reverse: no connected devices or emulators found.");
  process.exit(0);
}

for (const line of deviceLines) {
  const serial = line.split(/\s+/)[0];
  execFileSync(adb, ["-s", serial, "reverse", `tcp:${PORT}`, `tcp:${PORT}`]);
  console.log(`adb-reverse: localhost:${PORT} forwarded on ${serial}`);
}
