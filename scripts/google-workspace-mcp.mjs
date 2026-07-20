#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const value = (flag) => argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : null;
const profileId = value("--profile");
const project = value("--project");
const apply = argv.includes("--apply");
const jsonMode = argv.includes("--json");
const confirmation = value("--confirm");

if (!profileId || !project) {
  console.error("Usage: node scripts/google-workspace-mcp.mjs --profile <profile> --project <GOOGLE_CLOUD_PROJECT_ID> [--apply --confirm ENABLE_GOOGLE_WORKSPACE_MCP] [--json]");
  process.exit(2);
}
if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project)) {
  console.error("PROJECT_ID must look like a Google Cloud project ID; do not pass a credential, email address, or secret.");
  process.exit(2);
}

const catalog = JSON.parse(readFileSync(path.join(process.cwd(), "catalog/google-workspace-profiles.json"), "utf8"));
const profile = catalog.profiles.find((item) => item.id === profileId);
if (!profile) {
  console.error(`Unknown Google Workspace MCP profile: ${profileId}. Available: ${catalog.profiles.map((item) => item.id).join(", ")}`);
  process.exit(2);
}

const plan = {
  profile: profile.id,
  label: profile.label,
  project,
  services: profile.services,
  scopes: profile.scopes,
  servers: profile.servers,
  first_verification: profile.first_verification,
  additional_setup: profile.additional_setup || null,
  gcloud_command: ["gcloud", "services", "enable", ...profile.services, `--project=${project}`],
  reminders: [
    "Create or select the Google Cloud project yourself.",
    "Configure the OAuth consent screen and add only the shown scopes.",
    "Create an OAuth Web client with the redirect URI required by your provider.",
    "Enter OAuth client ID and secret only in the provider's secure UI; never commit them."
  ]
};

if (jsonMode) process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
else {
  console.log(`Google Workspace MCP profile: ${plan.label}`);
  console.log(`Project: ${project}`);
  console.log(`Services: ${plan.services.join(", ")}`);
  console.log(`Scopes: ${plan.scopes.join(", ")}`);
  console.log(`Endpoints: ${plan.servers.map((server) => `${server.id}=${server.url}`).join(", ")}`);
  console.log(`First verification: ${plan.first_verification}`);
  if (plan.additional_setup) console.log(`Additional setup: ${plan.additional_setup}`);
  console.log(`Preview command: ${plan.gcloud_command.join(" ")}`);
}

if (!apply) {
  if (!jsonMode) console.log("Dry run only. No Google Cloud service has been enabled.");
  process.exit(0);
}
if (confirmation !== "ENABLE_GOOGLE_WORKSPACE_MCP") {
  console.error("Refusing to enable Google Cloud services without --confirm ENABLE_GOOGLE_WORKSPACE_MCP.");
  process.exit(2);
}
try {
  execFileSync("gcloud", ["--version"], { stdio: "ignore" });
} catch {
  console.error("gcloud is required for --apply. Install and authenticate it first, then rerun this command.");
  process.exit(1);
}

console.log(`Enabling ${plan.services.length} Google Cloud services for profile ${profile.id}…`);
execFileSync("gcloud", ["services", "enable", ...profile.services, `--project=${project}`], { stdio: "inherit" });
console.log("Services enabled. Complete OAuth and provider connector setup before testing the remote MCP.");
