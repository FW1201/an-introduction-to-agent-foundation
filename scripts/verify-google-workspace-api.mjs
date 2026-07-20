#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";

const catalog = JSON.parse(readFileSync(path.join(process.cwd(), "catalog/google-workspace-api-profiles.json"), "utf8"));
const required = new Map([
  ["docs-create", "docs.googleapis.com"],
  ["slides-create", "slides.googleapis.com"],
  ["sheets-create", "sheets.googleapis.com"],
  ["forms-create", "forms.googleapis.com"],
  ["apps-script-execute", "script.googleapis.com"],
  ["classroom-courses-readonly", "classroom.googleapis.com"]
]);
for (const [id, service] of required) {
  const profile = catalog.profiles.find((item) => item.id === id);
  if (!profile || profile.service !== service) throw new Error(`Missing or invalid API profile: ${id}`);
  if (profile.scopes?.some((scope) => /drive\.readonly$|auth\/drive$/.test(scope))) throw new Error(`API profile ${id} requests an unnecessarily broad Drive scope.`);
}
const example = JSON.parse(readFileSync(path.join(process.cwd(), "templates/wiki-project/google-workspace-api.example.json"), "utf8"));
if (example.oauth?.clientSecret && example.oauth.clientSecret !== "DO_NOT_STORE_HERE") throw new Error("API example must not contain an OAuth client secret.");
console.log("Google Workspace API catalog and safe example configuration are valid. Enable one profile at a time and verify before resource creation.");
