#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const argv = process.argv.slice(2);
const value = (flag) => {
  const index = argv.indexOf(flag);
  return index === -1 ? null : argv[index + 1];
};
const binary = value("--binary") || "gws";
const requireInstalled = argv.includes("--require-installed") || value("--binary") !== null;
const catalogPath = path.join(root, "catalog/google-workspace-cli.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));

if (catalog.source_repository !== "https://github.com/googleworkspace/cli") {
  throw new Error("Google Workspace source must be googleworkspace/cli.");
}
if (catalog.package !== "@googleworkspace/cli" || catalog.executable !== "gws") {
  throw new Error("Catalog must install @googleworkspace/cli and expose gws.");
}
const expectedInstall = `npm install -g ${catalog.package}@${catalog.compatibility_snapshot.package_version}`;
if (catalog.install.command.join(" ") !== expectedInstall) {
  throw new Error("The beginner install path must use the single gws npm package.");
}
if (catalog.authentication.mode !== "manual OAuth through Google Cloud Console") {
  throw new Error("Authentication must use the documented manual OAuth path.");
}
if (!catalog.authentication.first_login.includes("--readonly")) {
  throw new Error("First login must request read-only access.");
}
if (
  !catalog.write_policy.dry_run_before_write ||
  !catalog.write_policy.semantic_read_back_required ||
  catalog.write_policy.raw_command_output_in_chat_logs_or_wiki !== false ||
  catalog.write_policy.credential_export_allowed !== false
) {
  throw new Error("Write policy must require dry run, semantic read-back, output minimization, and no credential export.");
}
const requiredWriteScopes = [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/presentations",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/forms.body",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/drive.file"
];
const configuredWriteScopes = new Set(catalog.write_scope_upgrades.map((item) => item.scope));
for (const scope of requiredWriteScopes) {
  if (!configuredWriteScopes.has(scope)) throw new Error(`Missing single-service write scope: ${scope}`);
}

const requiredReferences = [
  ["README.md", "googleworkspace/cli"],
  ["README.md", "@googleworkspace/cli@0.22.5"],
  ["README.md", "gws auth login --readonly -s drive"],
  ["AGENTS.md", "workflows/google-workspace-cli.md"],
  ["AGENTS.md", "gws auth export --unmasked"],
  ["workflows/google-workspace-cli.md", "--dry-run"],
  ["workflows/google-workspace-cli.md", ".agent-foundation/install-log.json"],
  ["scripts/doctor.mjs", "\"gws\""],
  ["site/index.html", "<code>gws</code>"],
  ["agents/teaching.md", "workflows/google-workspace-cli.md"],
  ["agents/homeroom.md", "`gws`"],
  ["agents/administration.md", "workflows/google-workspace-cli.md"],
  ["templates/wiki-project/google-workspace-cli.example.json", "pageSize\\\":1"]
];
for (const [file, expected] of requiredReferences) {
  const content = readFileSync(path.join(root, file), "utf8");
  if (!content.includes(expected)) throw new Error(`${file} is missing required gws guidance: ${expected}`);
}

const legacyApi = ["google", "workspace", "api"].join("-");
const legacyConnector = ["google", "workspace", "mcp"].join("-");
const legacyCloudTool = ["google", "cloud", "cli"].join("-");
const removedFiles = [
  `catalog/${legacyApi}-profiles.json`,
  `catalog/${["google", "workspace", "profiles"].join("-")}.json`,
  `scripts/${legacyCloudTool}.mjs`,
  `scripts/${legacyApi}.mjs`,
  `scripts/${["google", "workspace", "links"].join("-")}.mjs`,
  `scripts/${legacyConnector}.mjs`,
  `scripts/${["google", "workspace", "resource"].join("-")}.mjs`,
  `scripts/${["verify", legacyApi].join("-")}.mjs`,
  `scripts/${["verify", legacyConnector].join("-")}.mjs`,
  `templates/wiki-project/${legacyApi}.example.json`,
  `templates/wiki-project/${legacyConnector}.example.json`,
  `workflows/${legacyApi}.md`
];
for (const file of removedFiles) {
  if (existsSync(path.join(root, file))) throw new Error(`Obsolete Google integration remains: ${file}`);
}

const forbidden = [
  ["g", "cloud"].join(""),
  legacyConnector,
  legacyApi,
  ["gws auth", "setup"].join(" "),
  ["drivem", "cp.googleapis.com"].join(""),
  ["gmailm", "cp.googleapis.com"].join(""),
  ["calendarm", "cp.googleapis.com"].join(""),
  ["chatm", "cp.googleapis.com"].join(""),
  ["people.googleapis.com/", "mcp"].join(""),
  ["enable", "_google_workspace_"].join(""),
  ["create", "_google_workspace_resource"].join(""),
  ["drive", "-readonly"].join(""),
  ["gmail", "-draft"].join(""),
  ["calendar", "-planning"].join(""),
  ["people", "-readonly"].join(""),
  ["chat", "-readonly"].join("")
];
const textExtensions = new Set([".json", ".md", ".mjs", ".js", ".html", ".yml", ".yaml", ".sh", ".ps1"]);
function visit(directory) {
  for (const entry of readdirSync(directory)) {
    if (entry === ".git" || entry === "node_modules") continue;
    const fullPath = path.join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      visit(fullPath);
      continue;
    }
    if (!textExtensions.has(path.extname(entry)) && !["AGENTS.md", "README.md", ".gitignore"].includes(entry)) continue;
    const content = readFileSync(fullPath, "utf8").toLowerCase();
    for (const token of forbidden) {
      if (content.includes(token)) {
        throw new Error(`Obsolete Google integration token remains in ${path.relative(root, fullPath)}: ${token}`);
      }
    }
  }
}
visit(root);

if (requireInstalled) {
  const version = execFileSync(binary, ["--version"], { encoding: "utf8" }).trim();
  const loginHelp = execFileSync(binary, ["auth", "login", "--help"], { encoding: "utf8" });
  const detectedVersion = version.match(/\b\d+\.\d+\.\d+\b/)?.[0] || null;
  if (
    detectedVersion !== catalog.compatibility_snapshot.package_version ||
    !loginHelp.includes("--readonly") ||
    !loginHelp.includes("--services") ||
    !loginHelp.includes("--scopes")
  ) {
    throw new Error("Installed gws binary does not expose the expected version and least-privilege login flags.");
  }
  console.log(`Installed Google Workspace CLI is compatible: ${version.split("\n")[0]}`);
} else {
  console.log("Google Workspace CLI catalog, Agent 101 guidance, removal checks, and safety policy are valid.");
}
