#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const value = (flag) => argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : null;
const profileId = value("--profile");
const resourceId = value("--id");
if (!profileId || !resourceId) {
  console.error("Usage: node scripts/google-workspace-links.mjs --profile <docs-create|slides-create|sheets-create|forms-create> --id <RESOURCE_ID>");
  process.exit(2);
}
if (!/^[A-Za-z0-9_-]{8,200}$/.test(resourceId)) {
  console.error("RESOURCE_ID must be an opaque Google resource ID; do not pass a URL, credential, email address, or secret.");
  process.exit(2);
}

const catalog = JSON.parse(readFileSync(path.join(process.cwd(), "catalog/google-workspace-api-profiles.json"), "utf8"));
const profile = catalog.profiles.find((item) => item.id === profileId);
if (!profile?.output_link_template) {
  console.error("This profile has no safe deterministic link template. Use the API-returned alternateLink instead.");
  process.exit(2);
}
console.log(profile.output_link_template.replace("{id}", resourceId));
