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
  console.error("Usage: node scripts/google-workspace-api.mjs --profile <profile> --project <GOOGLE_CLOUD_PROJECT_ID> [--apply --confirm ENABLE_GOOGLE_WORKSPACE_API] [--json]");
  process.exit(2);
}
if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project)) {
  console.error("PROJECT_ID must look like a Google Cloud project ID; do not pass a credential, email address, or secret.");
  process.exit(2);
}

const catalog = JSON.parse(readFileSync(path.join(process.cwd(), "catalog/google-workspace-api-profiles.json"), "utf8"));
const profile = catalog.profiles.find((item) => item.id === profileId);
if (!profile) {
  console.error(`Unknown Google Workspace API profile: ${profileId}. Available: ${catalog.profiles.map((item) => item.id).join(", ")}`);
  process.exit(2);
}

const plan = {
  profile: profile.id,
  label: profile.label,
  project,
  service: profile.service,
  scopes: profile.scopes,
  operation: profile.operation,
  first_verification: profile.first_verification,
  output_link_template: profile.output_link_template || null,
  additional_requirements: profile.additional_requirements || [],
  console_url: `https://console.cloud.google.com/apis/library/${profile.service}?project=${project}`,
  gcloud_command: ["gcloud", "services", "enable", profile.service, `--project=${project}`],
  adc_auth_command: profile.scopes.length ? ["gcloud", "auth", "application-default", "login", "--scopes", ["https://www.googleapis.com/auth/cloud-platform", ...profile.scopes].join(",")] : null,
  reminders: [
    "Console mode is the default: use the console URL to enable one API manually.",
    "gcloud is recommended only for Agent-assisted enablement and local OAuth; it is not required for Console mode.",
    "Do not paste OAuth secrets, refresh tokens, or student data into this project or chat.",
    "Generating a resource, publishing it, sharing it, and collecting responses are separate confirmation steps."
  ]
};

if (jsonMode) process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
else {
  console.log(`Google Workspace API profile: ${plan.label}`);
  console.log(`Project: ${project}`);
  console.log(`Service: ${plan.service}`);
  console.log(`Scopes: ${plan.scopes.length ? plan.scopes.join(", ") : "declared by the existing Apps Script"}`);
  console.log(`Operation: ${plan.operation}`);
  console.log(`First verification: ${plan.first_verification}`);
  console.log(`Console mode: ${plan.console_url}`);
  console.log(`Agent-assisted command: ${plan.gcloud_command.join(" ")}`);
  if (plan.adc_auth_command) console.log(`Local OAuth command after confirmation: ${plan.adc_auth_command.join(" ")}`);
  if (plan.additional_requirements.length) console.log(`Additional requirements: ${plan.additional_requirements.join("; ")}`);
}

if (!apply) {
  if (!jsonMode) console.log("Dry run only. No Google Cloud API has been enabled.");
  process.exit(0);
}
if (confirmation !== "ENABLE_GOOGLE_WORKSPACE_API") {
  console.error("Refusing to enable a Google Workspace API without --confirm ENABLE_GOOGLE_WORKSPACE_API.");
  process.exit(2);
}
try {
  execFileSync("gcloud", ["--version"], { stdio: "ignore" });
} catch {
  console.error("gcloud is required for --apply. Use Console mode or install and authenticate gcloud first.");
  process.exit(1);
}

console.log(`Enabling ${plan.service} for profile ${profile.id}…`);
execFileSync("gcloud", ["services", "enable", plan.service, `--project=${project}`], { stdio: "inherit" });
console.log("API enabled. Complete the profile's OAuth and verification steps before any resource creation.");
