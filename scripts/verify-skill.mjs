#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const value = (flag) => argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : null;
const id = value("--id");
const skillPath = value("--path");
if (!id && !skillPath) {
  console.error("Usage: node scripts/verify-skill.mjs --id <catalog-id> [--path <installed-skill-directory>]");
  process.exit(2);
}

if (id) {
  const catalog = JSON.parse(readFileSync(path.join(process.cwd(), "catalog/skills.json"), "utf8"));
  if (!catalog.skills.some((skill) => skill.id === id)) throw new Error(`Skill ${id} is not in the approved catalog.`);
  console.log(`Approved skill catalog entry found: ${id}`);
}
if (skillPath) {
  const manifest = path.join(skillPath, "SKILL.md");
  if (!existsSync(manifest)) throw new Error(`Installed skill has no SKILL.md: ${manifest}`);
  const contents = readFileSync(manifest, "utf8");
  if (!contents.includes("description:")) throw new Error("SKILL.md has no description frontmatter.");
  console.log(`Installed skill manifest is readable: ${manifest}`);
}
console.log("Run the catalog's minimum verification case in your Agent before treating the skill as ready.");
