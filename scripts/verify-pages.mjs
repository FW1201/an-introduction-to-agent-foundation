#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";

const argv = process.argv.slice(2);
const value = (flag) => argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : null;
const workflow = value("--workflow");
const site = value("--site");
const url = value("--url");

if (workflow) {
  const source = readFileSync(workflow, "utf8");
  for (const required of ["actions/configure-pages", "actions/upload-pages-artifact", "actions/deploy-pages", "pages: write", "id-token: write"]) {
    if (!source.includes(required)) throw new Error(`Pages workflow is missing ${required}`);
  }
  console.log("Pages workflow contains the required official deployment actions and permissions.");
}
if (site) {
  if (!existsSync(`${site}/index.html`)) throw new Error(`Static site is missing ${site}/index.html`);
  console.log(`Static site entry point exists: ${site}/index.html`);
}
if (url) {
  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Pages URL returned HTTP ${response.status}`);
  console.log(`Pages URL is reachable: ${response.url}`);
}
if (!workflow && !site && !url) {
  console.error("Usage: node scripts/verify-pages.mjs [--workflow <pages.yml>] [--site <dir>] [--url <published-url>]");
  process.exit(2);
}
