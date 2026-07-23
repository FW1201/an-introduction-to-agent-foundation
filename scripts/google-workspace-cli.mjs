#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const jsonMode = args.has("--json");
const catalog = JSON.parse(
  readFileSync(path.join(process.cwd(), "catalog/google-workspace-cli.json"), "utf8")
);

let installed = false;
let version = null;
let detectedVersion = null;
try {
  version = execFileSync(catalog.executable, ["--version"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  }).trim().split("\n")[0];
  installed = true;
  detectedVersion = version.match(/\b\d+\.\d+\.\d+\b/)?.[0] || null;
} catch {
  // gws is optional. A missing binary is reported as the next action, not a failure.
}
const expectedVersion = catalog.compatibility_snapshot.package_version;
const compatible = installed && detectedVersion === expectedVersion;

const report = {
  schema_version: 1,
  tool: catalog.executable,
  source: catalog.source_repository,
  installed,
  version,
  detected_version: detectedVersion,
  expected_version: expectedVersion,
  compatible,
  authentication_checked: false,
  next_actions: compatible
    ? [
        "Use the manual OAuth steps in workflows/google-workspace-cli.md.",
        "Start with read-only Drive access and run the catalog's first verification."
      ]
    : installed
      ? [
          `Do not log in with this unverified version. After user confirmation, install the tested version: ${catalog.install.command.join(" ")}`
        ]
    : [
        `Review ${catalog.source_repository}.`,
        `After user confirmation, run: ${catalog.install.command.join(" ")}`
      ]
};

if (jsonMode) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log(`Google Workspace CLI (${catalog.executable})`);
  console.log(
    compatible
      ? `✓ installed and compatible — ${version}`
      : installed
        ? `△ installed but unverified — ${version}; expected ${expectedVersion}`
        : "○ not installed (optional)"
  );
  console.log(`Source: ${catalog.source_repository}`);
  console.log(`Next: ${report.next_actions.join(" ")}`);
  console.log("No login, API call, installation, or configuration change was performed.");
}
