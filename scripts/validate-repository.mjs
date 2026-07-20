#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalogDir = path.join(root, "catalog");
const required = ["AGENTS.md", "README.md", "WIKI.md", ".agent-foundation/progress.json", "wiki/index.md", "wiki/log.md", "catalog/environment.json", "catalog/providers.json", "catalog/mcps.json", "catalog/google-workspace-profiles.json", "catalog/google-workspace-api-profiles.json", "catalog/skills.json", "catalog/references.json", "catalog/cases.json", "agents/coordinator.md", "agents/teaching.md", "agents/homeroom.md", "agents/administration.md", "workflows/archive-output.md", "workflows/google-workspace-api.md", "templates/wiki-project/.agent-foundation/progress.json", "templates/wiki-project/wiki/index.md", "templates/wiki-project/google-workspace-mcp.example.json", "templates/wiki-project/google-workspace-api.example.json", "templates/github-pages-app/index.html", "scripts/google-cloud-cli.mjs", "scripts/google-workspace-mcp.mjs", "scripts/verify-google-workspace-mcp.mjs", "scripts/google-workspace-api.mjs", "scripts/google-workspace-resource.mjs", "scripts/google-workspace-links.mjs", "scripts/verify-google-workspace-api.mjs", ".github/workflows/validate.yml", ".github/workflows/pages.yml"];

let failures = 0;
for (const file of required) {
  if (!existsSync(path.join(root, file))) {
    console.error(`Missing required file: ${file}`);
    failures += 1;
  }
}

for (const name of readdirSync(catalogDir).filter((file) => file.endsWith(".json"))) {
  try {
    JSON.parse(readFileSync(path.join(catalogDir, name), "utf8"));
  } catch (error) {
    console.error(`Invalid JSON: catalog/${name}: ${error.message}`);
    failures += 1;
  }
}

const progressPath = path.join(root, "templates/wiki-project/.agent-foundation/progress.json");
try {
  const progress = JSON.parse(readFileSync(progressPath, "utf8"));
  if (!progress.schema_version || !Object.hasOwn(progress, "current_stage")) throw new Error("missing schema_version or current_stage");
} catch (error) {
  console.error(`Invalid progress template: ${error.message}`);
  failures += 1;
}

if (failures) process.exitCode = 1;
else console.log("Repository structure and JSON catalogs are valid.");
