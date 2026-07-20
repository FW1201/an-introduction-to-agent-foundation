#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const value = (flag) => argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : null;
const profileId = value("--profile");
const title = value("--title");
const apply = argv.includes("--apply");
const confirmation = value("--confirm");
if (!profileId || !title) {
  console.error("Usage: node scripts/google-workspace-resource.mjs --profile <docs-create|slides-create|sheets-create|forms-create> --title <TITLE> [--apply --confirm CREATE_GOOGLE_WORKSPACE_RESOURCE]");
  process.exit(2);
}
if (title.length > 200 || /[\r\n\0]/.test(title)) {
  console.error("TITLE must be a single line of at most 200 characters. Do not include student data or secrets.");
  process.exit(2);
}

const catalog = JSON.parse(readFileSync(path.join(process.cwd(), "catalog/google-workspace-api-profiles.json"), "utf8"));
const profile = catalog.profiles.find((item) => item.id === profileId);
if (!profile || profile.operation !== "create-resource") {
  console.error("This command only supports docs-create, slides-create, sheets-create, or forms-create. Apps Script and Classroom use their own explicit workflows.");
  process.exit(2);
}

const requests = {
  "docs-create": { url: "https://docs.googleapis.com/v1/documents", body: { title }, idField: "documentId" },
  "slides-create": { url: "https://slides.googleapis.com/v1/presentations", body: { title }, idField: "presentationId" },
  "sheets-create": { url: "https://sheets.googleapis.com/v4/spreadsheets", body: { properties: { title } }, idField: "spreadsheetId" },
  "forms-create": { url: "https://forms.googleapis.com/v1/forms", body: { info: { title } }, idField: "formId" }
};
const request = requests[profile.id];
const plan = {
  profile: profile.id,
  action: "Create one empty Google Workspace resource",
  title,
  confirmation_required: "CREATE_GOOGLE_WORKSPACE_RESOURCE",
  prerequisites: [
    `Enable ${profile.service} for a user-owned Google Cloud project.`,
    "Run the profile's local OAuth command through gcloud application-default login.",
    "Confirm this title, private visibility, no-sharing setting, and local draft QA."
  ],
  non_actions: ["No content is imported.", "No sharing, publishing, emailing, form distribution, or response collection is performed."],
  output: "On success, prints a single edit URL for Wiki outputs.md."
};

if (!apply) {
  console.log(JSON.stringify(plan, null, 2));
  console.log("Dry run only. No Google resource has been created.");
  process.exit(0);
}
if (confirmation !== "CREATE_GOOGLE_WORKSPACE_RESOURCE") {
  console.error("Refusing to create a Google Workspace resource without --confirm CREATE_GOOGLE_WORKSPACE_RESOURCE.");
  process.exit(2);
}

let token;
try {
  token = execFileSync("gcloud", ["auth", "application-default", "print-access-token"], { encoding: "utf8" }).trim();
} catch {
  console.error("Unable to obtain local application-default credentials. Complete the profile's gcloud OAuth login first; do not paste a token into this command.");
  process.exit(1);
}

const response = await fetch(request.url, {
  method: "POST",
  headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(request.body)
});
const responseBody = await response.json().catch(() => ({}));
if (!response.ok) {
  const message = responseBody?.error?.message || `HTTP ${response.status}`;
  console.error(`Google API did not create a resource: ${message}`);
  process.exit(1);
}
const id = responseBody[request.idField];
if (!id || !/^[A-Za-z0-9_-]{8,200}$/.test(id)) {
  console.error("Google API response did not contain a usable resource ID.");
  process.exit(1);
}
console.log(profile.output_link_template.replace("{id}", id));
