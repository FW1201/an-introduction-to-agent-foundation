# An Introduction to Agent Foundation

> 給教育工作者的 Agent 環境起步模板：讓 Agent 依專案規則，逐步帶你完成環境檢查、Wiki 知識庫、MCP、Skills、文件產製與可驗證的教育工作流。

這是一個 **GitHub Template**，不是大型平台或背景自動化服務。從 GitHub 的 **Use this template** 建立自己的工作區後，請在 Agent 中開啟專案並說：

> 請讀取 `AGENTS.md`，帶我完成 Agent Foundation 的環境檢查與第一個案例。

## 你將完成什麼

1. 檢查 Git、Node.js、npm、npx、GitHub CLI 與目前 Agent 環境。
2. 建立可被 Agent 讀取的 Wiki 專案結構。
3. 只對目前專案授權 filesystem MCP，並依需要加入 GitHub 或瀏覽器工具。
4. 安裝精選的 `tw-edu-skills`；Claude Code 使用者可選裝 Anthropic Document Skills。
5. 選裝 OfficeCLI，建立「產製 → 預覽 → 修正」的 Office 文件流程。
6. 需要 Google Workspace 時，只選裝一套 [`googleworkspace/cli`](https://github.com/googleworkspace/cli)。
7. 用教學簡報、測驗／學習單、導師／行政文件或迷你教具完成第一個成果。

## 安全邊界

- 每一項安裝、設定檔修改、登入、GitHub 寫入與公開發布，都要先由使用者明確確認。
- 預設只使用公開、授權或去識別資料；請勿放入學生姓名、學號、成績、聯絡方式或可辨識影像。
- Agent 不得在對話中要求 API key、token、OAuth client secret 或密碼。
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

## 選用：Google Workspace CLI

本模板將所有 Google Workspace 操作統一到 `gws`。它透過終端機提供結構化 JSON，不需要 Google 專用 provider 設定，也不再維護多套 profiles、自製資源建立腳本或遠端端點。

上游仍在 1.0 前的快速開發期，且明示不是 Google 正式支援產品；每次新工作流都要先查看 `--help` 與 `gws schema ...`，不能假設舊命令永遠不變。本模板目前驗證的相容版本是 `0.22.5`。

### 1. 只檢查，不安裝

```bash
npm run google-workspace:check
```

這個檢查不登入、不呼叫 Google API，也不修改任何設定。

### 2. 使用者確認後安裝

```bash
npm install -g @googleworkspace/cli@0.22.5
gws --version
```

安裝來源固定為 [`googleworkspace/cli`](https://github.com/googleworkspace/cli)。要移除時執行 `npm uninstall -g @googleworkspace/cli`。

### 3. 在 Cloud Console 手動建立 OAuth

1. 在自己的 Google Cloud 專案，透過 [API Library](https://console.cloud.google.com/apis/library) 只啟用這次需要的 Workspace API。
2. 在 [OAuth 同意畫面](https://console.cloud.google.com/apis/credentials/consent) 完成設定，並把自己的帳號加入測試使用者。
3. 在 [Credentials](https://console.cloud.google.com/apis/credentials) 建立 **Desktop app** OAuth client。
4. 將下載的 client JSON 直接存到 `~/.config/gws/client_secret.json`，不要放進這個 repository。
5. 第一次只授權 Drive 唯讀：

   ```bash
   gws auth login --readonly -s drive
   ```

OAuth 檔、token 與 credentials 不可貼進對話、Markdown、JSON、Wiki、log 或 Git，也禁止使用會輸出未遮蔽 credentials 的匯出操作。

### 4. 完成首次唯讀驗證

```bash
gws drive files list --params '{"pageSize":1,"fields":"files(id,mimeType)"}'
```

只有回傳有效 JSON、資料範圍符合預期且沒有敏感資料外洩，才能標記可用。原始輸出不得複製到對話、log 或 Wiki，只記錄去識別的成功／失敗摘要。需要 Gmail、Calendar 或其他服務時，仍從單一服務的唯讀授權開始。

### 5. 寫入前後都有閘門

以下範例只預演建立試算表，不會送出請求：

```bash
gws schema sheets.spreadsheets.create
# 使用者先另行確認 scope 升級；--scopes 必須是完整 URL
gws auth login \
  --scopes https://www.googleapis.com/auth/spreadsheets \
  -s sheets
gws sheets spreadsheets create \
  --json '{"properties":{"title":"Agent Foundation 測試（待確認）"}}' \
  --dry-run
```

Agent 必須先展示本機草稿、目標、參數、可見範圍、副作用與回復方式。唯讀授權升級為單一完整 write scope 需要一次確認；使用者針對實際寫入再確認後，才可移除 `--dry-run`。完成後還要讀回標題、位置與分享狀態。寄送、分享、公開發布與刪除各自需要新的確認。`--dry-run` 可能含完整內容或收件者，因此只記錄去識別摘要，不保存原始 request body。

完整步驟見 `workflows/google-workspace-cli.md`，機器可讀規格見 `catalog/google-workspace-cli.json`。

## 驗證

```bash
npm test
node scripts/verify-mcp.mjs --config templates/wiki-project/.mcp.example.json --workspace "$PWD"
node scripts/verify-skill.mjs --id tw-edu-exam-generator
node scripts/verify-google-workspace-cli.mjs
node scripts/verify-pages.mjs --workflow .github/workflows/pages.yml --site site
```

如果本機已安裝 `gws`，可再執行實體相容性檢查：

```bash
node scripts/verify-google-workspace-cli.mjs --require-installed
```

`verify-pages.mjs --url https://example.github.io/project/` 可在完成發布後檢查公開網址。

## 專案狀態

第一版是「角色化工作流」：由一個協調 Agent 調度三種角色，不啟動會平行寫入檔案的技術 subagent。未來僅考慮加入唯讀 QA 子代理。

## 參考來源

- [Google Workspace CLI](https://github.com/googleworkspace/cli)
- [Anthropic Skills](https://github.com/anthropics/skills)
- [MCP filesystem server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [OfficeCLI](https://github.com/iOfficeAI/OfficeCLI)
- [GitHub Pages Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
