# An Introduction to Agent Foundation

> 給教育工作者的 Agent 環境起步模板：讓 Agent 依專案規則，逐步帶你完成環境檢查、Wiki 知識庫、MCP、Skills、文件產製與可驗證的教育工作流。

這是一個 **GitHub Template**，不是大型平台或背景自動化服務。從 GitHub 的 **Use this template** 建立自己的工作區後，請在 Agent 中開啟專案並說：

> 請讀取 `AGENTS.md`，帶我完成 Agent Foundation 的環境檢查與第一個案例。

## 你將完成什麼

1. 檢查 Git、Node.js、npm、npx、GitHub CLI 與目前 Agent 環境。
2. 建立可被 Agent 讀取的 Wiki 專案結構。
3. 只對目前專案授權的 filesystem MCP，並依需要加入 GitHub、瀏覽器或 Google Workspace 工具。
4. 安裝精選的 `tw-edu-skills`；Claude Code 使用者可選裝 Anthropic Document Skills。
5. 選裝 OfficeCLI，建立「產製 → 預覽 → 修正」的 Office 文件流程。
6. 用教學簡報、測驗／學習單、導師／行政文件或迷你教具完成第一個成果。

## 安全邊界

- 每一項安裝、設定檔修改、登入、GitHub 寫入與公開發布，都要先由使用者明確確認。
- 預設只使用公開、授權或去識別資料；請勿放入學生姓名、學號、成績、聯絡方式或可辨識影像。
- Agent 不得在對話中要求 API key、token 或密碼。
- `raw/private/`、`.env`、私密金鑰與 session 檔已被 `.gitignore` 排除。

## 快速開始

### 1. 建立個人 Workspace

在 GitHub 選擇 **Use this template**，建立自己的 repository，clone 後於專案根目錄開啟 Agent。

### 2. 執行環境檢查

Agent 可以直接依 `AGENTS.md` 執行。也可以手動執行：

```bash
node scripts/doctor.mjs
node scripts/doctor.mjs --json
```

若連 Node.js 都尚未安裝，請先讓 Agent 依你的系統執行：

```bash
# macOS / Linux
scripts/bootstrap/doctor-macos.sh
scripts/bootstrap/doctor-linux.sh

# Windows PowerShell
scripts/bootstrap/doctor-windows.ps1
```

### 3. 建立 Wiki 任務紀錄

Template 根目錄已包含空白的 `raw/`、`wiki/`、`outputs/`、`logs/` 與 `.agent-foundation/`。請 Agent 依 `workflows/wiki-intake.md` 建立第一筆任務。若要在另一個空白資料夾建立新 Workspace，可執行 `npm run init:workspace -- --dir <資料夾>`。每一筆成果都需要回寫：來源、決策、QA、輸出與反思。

### 4. 選擇角色與案例

| 角色 | 適合的第一個案例 |
| --- | --- |
| 教學設計 | 教學簡報、命題、學習單、迷你教具 |
| 導師／親師溝通 | 班級經營、親師信件草稿 |
| 行政文件 | 會議議程、活動計畫、成果報告 |

詳見 `agents/` 與 `catalog/cases.json`。

## Skills 與文件工具

第一批只推薦安裝一項教育 Skill，再完成一個最小案例。精選目錄與前置條件在 `catalog/skills.json`。

- `tw-edu-skills`：教育目標、課程、評量與學習者適配。
- Anthropic Document Skills（Claude Code 選用）：PPTX、DOCX、PDF、XLSX 檔案格式工作。
- OfficeCLI（選用）：建立與渲染 Office 文件，供 Agent 檢查版面。

同一份文件只能有一個「產製主責」。教育 Skill 先決定內容與教學規格；文件 Skill 處理格式；OfficeCLI 處理產製與預覽。

## 選用：Google Workspace MCP

Google Workspace 是一組**遠端** MCP，而不是單一套件。請先選需要的產品與最小權限：

| Profile | 能力 | 預設風險 |
| --- | --- | --- |
| `drive-readonly` | 搜尋、讀取 Drive 檔案 | 讀取 Workspace 資料 |
| `calendar-planning` | 讀取日曆與忙閒資訊 | 讀取行程資訊 |
| `gmail-draft` | 搜尋信件、建立草稿 | 讀取郵件與建立草稿，不自動寄送 |
| `people-readonly` | 讀取聯絡人／目錄資料 | 讀取聯絡人資料 |
| `chat-readonly` | 讀取 Chat 空間與訊息 | 讀取工作通訊內容 |

預設建議從 `drive-readonly` 開始。這項整合需要 Google Cloud 專案、對應 API／MCP API 與 OAuth 2.0 client。`gcloud` 只在要讓 Agent 以指令啟用服務時才建議安裝；只用 Cloud Console 不需要它。OAuth client secret 只能在 Google Cloud 與 Agent provider 的安全設定介面處理，絕不能貼進聊天或 commit。

```bash
# 先檢視將啟用的 Google 服務與 OAuth scopes，不修改雲端設定
node scripts/google-workspace-mcp.mjs --profile drive-readonly --project YOUR_PROJECT_ID

# 使用者已確認後才啟用所需服務
node scripts/google-workspace-mcp.mjs --profile drive-readonly --project YOUR_PROJECT_ID --apply --confirm ENABLE_GOOGLE_WORKSPACE_MCP

# 檢查 profile 與設定範本一致
node scripts/verify-google-workspace-mcp.mjs --profile drive-readonly --config templates/wiki-project/google-workspace-mcp.example.json
```

完整引導見 `workflows/install-mcp.md` 與 [Google Workspace 官方 MCP 指南](https://developers.google.com/workspace/guides/configure-mcp-servers?hl=zh-tw)。

## 選用：Google Workspace API 與資源連結

Docs、Slides、Sheets、Forms、Apps Script 與 Classroom API 不是目前官方遠端 MCP 清單的一部分。Template 因此把它們列為**API profile**：先讓 Agent 產生並審閱本機內容，再在你確認後啟用單一 API、建立資源或讀取最小資料，最後把資源連結回寫 Wiki。

| Profile | 第一版行為 | 不會自動做的事 |
| --- | --- | --- |
| `docs-create` | 建立空白 Docs 並回傳編輯連結 | 匯入未審閱內容、分享或公開 |
| `slides-create` | 建立空白 Slides 並回傳編輯連結 | 發布、分享或自動排版完整簡報 |
| `sheets-create` | 建立空白 Sheets 並回傳編輯連結 | 匯入學生名冊、成績或聯絡資料 |
| `forms-create` | 建立空白 Forms 並回傳編輯連結 | 發送表單或蒐集回覆 |
| `apps-script-execute` | 檢查既有 API executable 的前置條件 | 建立、修改或執行 Script |
| `classroom-courses-readonly` | 唯讀列出目前使用者可見課程 | 名冊、作業、成績、建立課程或發布教材 |

### 要不要安裝 gcloud？

先執行下列指令。它只說明你的選項，不安裝任何東西。

```bash
node scripts/google-cloud-cli.mjs
```

- **Console-first（預設）**：只要在 Google Cloud Console 啟用一個 API，不必安裝 `gcloud`。
- **Agent-assisted（建議給要反覆使用的人）**：安裝 `gcloud` 後，Agent 可先顯示確切 API／scope，再用可重現指令啟用；macOS + Homebrew 的建議指令是 `brew install --cask gcloud-cli`，但仍必須由使用者確認後才可執行。

### 最短 API 流程

```bash
# 只顯示需要啟用的 API、scope、Console URL 與可選 CLI 指令；不修改任何設定
node scripts/google-workspace-api.mjs --profile docs-create --project YOUR_PROJECT_ID

# 使用者選擇 Agent-assisted 模式且明確確認後，才以 gcloud 啟用該一項 API
node scripts/google-workspace-api.mjs --profile docs-create --project YOUR_PROJECT_ID --apply --confirm ENABLE_GOOGLE_WORKSPACE_API

# 完成本機 OAuth、審閱草稿並再次確認後，才建立一份空白 Docs 並只輸出其編輯連結
node scripts/google-workspace-resource.mjs --profile docs-create --title "測試教案（請刪除）" --apply --confirm CREATE_GOOGLE_WORKSPACE_RESOURCE
```

Google 文件、簡報、試算表與表單的「建立資源」仍是外部寫入：Agent 必須先展示本機草稿、標題、可見範圍與分享設定，再請你確認。Template 的最小 bridge 只會用本機 `gcloud` application-default OAuth 建立空白資源並輸出連結；不會匯入內容、分享、發布或收集回覆。完整內容同步及 Apps Script／Classroom 寫入仍需要專用、已驗證的整合。完整邊界與回寫規則見 `workflows/google-workspace-api.md`。

## 驗證

```bash
npm test
node scripts/verify-mcp.mjs --config templates/wiki-project/.mcp.example.json --workspace "$PWD"
node scripts/verify-skill.mjs --id tw-edu-exam-generator
node scripts/verify-google-workspace-mcp.mjs --profile drive-readonly --config templates/wiki-project/google-workspace-mcp.example.json
node scripts/verify-google-workspace-api.mjs
node scripts/verify-pages.mjs --workflow .github/workflows/pages.yml --site site
```

`verify-pages.mjs --url https://example.github.io/project/` 可在完成發布後檢查公開網址。

## 專案狀態

第一版是「角色化工作流」：由一個協調 Agent 調度三種角色，不啟動會平行寫入檔案的技術 subagent。未來僅考慮加入唯讀 QA 子代理。

## 參考來源

- [Anthropic Skills](https://github.com/anthropics/skills)
- [MCP filesystem server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [OfficeCLI](https://github.com/iOfficeAI/OfficeCLI)
- [Google Workspace MCP 指南](https://developers.google.com/workspace/guides/configure-mcp-servers?hl=zh-tw)
- [啟用 Google Workspace API](https://developers.google.com/workspace/guides/enable-apis?hl=zh-tw)
- [安裝 Google Cloud CLI](https://docs.cloud.google.com/sdk/docs/install-sdk)
- [GitHub Pages Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
