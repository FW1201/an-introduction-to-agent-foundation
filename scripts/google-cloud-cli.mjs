#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const platform = process.platform;
const installed = spawnSync("gcloud", ["--version"], { encoding: "utf8" });
const instructions = {
  darwin: {
    command: ["brew", "install", "--cask", "gcloud-cli"],
    note: "Homebrew 安裝方式；執行前仍需使用者確認。"
  },
  win32: {
    command: null,
    note: "使用 Google 官方 Windows installer，完成後重新開啟 PowerShell。"
  },
  linux: {
    command: null,
    note: "依發行版使用 Google 官方安裝指南；不要猜測套件來源。"
  }
};
const recommendation = instructions[platform] || { command: null, note: "請依 Google 官方安裝指南選擇對應系統的方式。" };
const result = {
  installed: installed.status === 0,
  version: installed.status === 0 ? installed.stdout.trim().split("\n")[0] : null,
  console_mode: "Google Cloud Console 啟用 API 不需要 gcloud。",
  agent_assisted_mode: "若要讓 Agent 以可重現指令啟用多個 API、執行本機 OAuth 登入或建立 Workspace 資源連結，建議安裝 gcloud。",
  recommended_install: recommendation,
  official_install_guide: "https://docs.cloud.google.com/sdk/docs/install-sdk"
};

if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
else {
  console.log(result.installed ? `gcloud available: ${result.version}` : "gcloud is not installed.");
  console.log(result.console_mode);
  console.log(result.agent_assisted_mode);
  if (recommendation.command) console.log(`Recommended command after confirmation: ${recommendation.command.join(" ")}`);
  console.log(recommendation.note);
  console.log(`Official guide: ${result.official_install_guide}`);
}
