#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const jsonMode = args.has("--json");
const quiet = args.has("--quiet");

function probe(command, commandArgs = ["--version"]) {
  try {
    const output = execFileSync(command, commandArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return { status: "available", command, output: output.split("\n")[0] || "available" };
  } catch {
    return { status: "missing", command, output: null };
  }
}

function provider(command, name) {
  const result = probe(command);
  return { id: name, ...result };
}

const platformManagers = {
  darwin: ["brew"],
  win32: ["winget"],
  linux: ["apt-get", "dnf", "pacman"]
};

const tools = [
  ["git", ["--version"]],
  ["node", ["--version"]],
  ["npm", ["--version"]],
  ["npx", ["--version"]],
  ["gh", ["--version"]],
  ["gws", ["--version"]],
  ["officecli", ["--version"]],
  ["python3", ["--version"]]
].map(([command, commandArgs]) => probe(command, commandArgs));

const gh = tools.find((tool) => tool.command === "gh");
let githubAuth = { status: "not_checked", output: null };
if (gh?.status === "available") {
  try {
    const output = execFileSync("gh", ["auth", "status"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    githubAuth = { status: "authenticated", output: output ? "GitHub CLI is authenticated." : "GitHub CLI is authenticated." };
  } catch (error) {
    githubAuth = { status: "not_authenticated", output: "Run gh auth login only before GitHub write or deployment." };
  }
}

const root = process.cwd();
const workspaceState = {
  root,
  agentsFile: existsSync(path.join(root, "AGENTS.md")),
  catalog: existsSync(path.join(root, "catalog", "environment.json")),
  progress: existsSync(path.join(root, ".agent-foundation", "progress.json")),
  wiki: existsSync(path.join(root, "wiki", "index.md"))
};

const report = {
  schema_version: 1,
  platform: process.platform,
  architecture: process.arch,
  package_managers: (platformManagers[process.platform] || []).map((name) => probe(name)),
  tools,
  github_auth: githubAuth,
  agent_hosts: [provider("codex", "codex"), provider("claude", "claude-code"), provider("opencode", "opencode"), provider("antigravity", "antigravity")],
  workspace: workspaceState,
  next_actions: []
};

for (const required of ["git", "node", "npm", "npx"]) {
  if (tools.find((tool) => tool.command === required)?.status === "missing") report.next_actions.push(`Install ${required} before adding MCP servers or Skills.`);
}
if (!workspaceState.agentsFile) report.next_actions.push("Open the Agent Foundation template root so AGENTS.md is available.");
if (gh?.status === "missing") report.next_actions.push("Install gh only when you are ready to create a GitHub repository or deploy Pages.");
if (tools.find((tool) => tool.command === "gws")?.status === "missing") report.next_actions.push("gws is optional; offer googleworkspace/cli only when the task needs Google Workspace.");
if (tools.find((tool) => tool.command === "officecli")?.status === "missing") report.next_actions.push("OfficeCLI is optional; offer it before a DOCX/PPTX production workflow.");

if (jsonMode) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else if (!quiet) {
  console.log(`Agent Foundation doctor (${report.platform}/${report.architecture})`);
  for (const tool of tools) console.log(`${tool.status === "available" ? "✓" : "○"} ${tool.command}${tool.output ? ` — ${tool.output}` : ""}`);
  console.log(`${githubAuth.status === "authenticated" ? "✓" : "○"} GitHub auth — ${githubAuth.status}`);
  console.log(`Workspace: AGENTS=${workspaceState.agentsFile} catalog=${workspaceState.catalog} wiki=${workspaceState.wiki}`);
  if (report.next_actions.length) console.log(`Next: ${report.next_actions.join(" ")}`);
}
