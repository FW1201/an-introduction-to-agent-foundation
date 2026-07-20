#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const index = argv.indexOf("--dir");
const destinationArg = index === -1 ? null : argv[index + 1];
if (!destinationArg) {
  console.error("Usage: node scripts/init-workspace.mjs --dir <empty-workspace-directory>");
  process.exit(2);
}

const destination = path.resolve(destinationArg);
if (existsSync(destination) && readdirSync(destination).length > 0) {
  console.error(`Refusing to overwrite non-empty directory: ${destination}`);
  process.exit(1);
}
mkdirSync(destination, { recursive: true });
const sourceRoot = process.cwd();
const scaffold = ["AGENTS.md", "README.md", "WIKI.md", ".gitignore", ".env.example", "package.json", ".agent-foundation", "agents", "catalog", "logs", "outputs", "raw", "scripts", "site", "templates", "wiki", "workflows", ".github"];
for (const item of scaffold) {
  cpSync(path.join(sourceRoot, item), path.join(destination, item), { recursive: true, errorOnExist: true });
}
console.log(`Created Agent Foundation workspace: ${destination}`);
console.log("Next: initialize Git if needed, then ask your Agent to read AGENTS.md and begin environment setup.");
