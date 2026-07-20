#!/usr/bin/env node
import { readFileSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const value = (flag) => argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : null;
const profileId = value("--profile");
const configPath = value("--config");
if (!profileId || !configPath) {
  console.error("Usage: node scripts/verify-google-workspace-mcp.mjs --profile <profile> --config <provider-config-example-or-local-file>");
  process.exit(2);
}

const catalog = JSON.parse(readFileSync(path.join(process.cwd(), "catalog/google-workspace-profiles.json"), "utf8"));
const profile = catalog.profiles.find((item) => item.id === profileId);
if (!profile) throw new Error(`Unknown Google Workspace MCP profile: ${profileId}`);
const config = JSON.parse(readFileSync(configPath, "utf8"));
const servers = config.mcpServers || config.servers;
if (!servers) throw new Error("No mcpServers or servers object found.");
for (const expected of profile.servers) {
  const server = servers[expected.id];
  if (!server) throw new Error(`Missing configured server: ${expected.id}`);
  const actualUrl = server.serverUrl || server.url;
  if (actualUrl !== expected.url) throw new Error(`Unexpected endpoint for ${expected.id}: ${actualUrl || "missing"}`);
}
for (const server of Object.values(servers)) {
  const secret = server?.oauth?.clientSecret;
  if (secret && secret !== "DO_NOT_STORE_HERE") {
    throw new Error("Configuration contains an OAuth client secret. Keep real credentials in the provider's secure UI or ignored local configuration only.");
  }
}
console.log(`Static Google Workspace MCP configuration matches ${profile.label}. Complete OAuth in the provider UI, then run the profile's read-only verification before enabling write actions.`);
