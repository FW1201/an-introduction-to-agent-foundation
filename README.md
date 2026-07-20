# An Introduction to Agent Foundation

> 給教育工作者的 Agent 環境起步模板：讓 Agent 依專案規則，逐步帶你完成環境檢查、Wiki 知識庫、MCP、Skills、文件產製與可驗證的教育工作流。

這是一個 **GitHub Template**，不是大型平台或背景自動化服務。從 GitHub 的 **Use this template** 建立自己的工作區後，請在 Agent 中開啟專案並說：

> 請讀取 `AGENTS.md`，帶我完成 Agent Foundation 的環境檢查與第一個案例。

## 你將完成什麼

1. 檢查 Git、Node.js、npm、npx、GitHub CLI 與目前 Agent 環境。
2. 建立可被 Agent 讀取的 Wiki 專案結構。
3. 只對目前專案授權的 filesystem MCP，並依需要加入 GitHub 或瀏覽器工具。
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

## 驗證

```bash
npm test
node scripts/verify-mcp.mjs --config templates/wiki-project/.mcp.example.json --workspace "$PWD"
node scripts/verify-skill.mjs --id tw-edu-exam-generator
node scripts/verify-pages.mjs --workflow .github/workflows/pages.yml --site site
```

`verify-pages.mjs --url https://example.github.io/project/` 可在完成發布後檢查公開網址。

## 專案狀態

第一版是「角色化工作流」：由一個協調 Agent 調度三種角色，不啟動會平行寫入檔案的技術 subagent。未來僅考慮加入唯讀 QA 子代理。

## 參考來源

- [Anthropic Skills](https://github.com/anthropics/skills)
- [MCP filesystem server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [OfficeCLI](https://github.com/iOfficeAI/OfficeCLI)
- [GitHub Pages Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
