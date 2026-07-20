#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const value = (flag) => argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : null;
const configPath = value("--config");
const workspaceInput = value("--workspace");
if (!configPath || !workspaceInput) {
  console.error("Usage: node scripts/verify-mcp.mjs --config <mcp.json> --workspace <project-root>");
  process.exit(2);
}

const workspace = realpathSync(workspaceInput);
const config = JSON.parse(readFileSync(configPath, "utf8"));
const filesystem = config.mcpServers?.filesystem || config.servers?.filesystem;
if (!filesystem) throw new Error("No filesystem MCP entry found.");
const args = filesystem.args || [];
const allowed = args.find((item) => typeof item === "string" && (item.includes("workspaceFolder") || path.isAbsolute(item)));
if (!allowed) throw new Error("Filesystem MCP must declare a workspace path.");
if (allowed === "/" || allowed === "~" || allowed.includes("..")) throw new Error("Filesystem MCP path is too broad.");
if (path.isAbsolute(allowed) && !path.resolve(allowed).startsWith(workspace)) throw new Error("Filesystem MCP may only access the current workspace.");
console.log(`Filesystem MCP configuration is scoped to the workspace (${workspace}). Run an Agent-side initialize plus read-only list/read call before marking it installed.`);
