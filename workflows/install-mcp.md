# MCP 安裝工作流

1. 依 `catalog/mcps.json` 解釋 MCP 的工具、權限、來源、驗證與移除方式。
2. 先檢查 Agent 是否已具有原生同等能力；有則不重複安裝。
3. filesystem MCP 只允許目前 workspace，初次驗證只執行 list/read。
4. 先備份 provider 設定，顯示設定 diff，取得確認後才合併。
5. 重啟／重新載入 Agent，完成 initialize 與無害 tool call。
6. GitHub、瀏覽器等外部工具在需要時再安裝，外部寫入仍需逐次確認。

## Google Workspace 遠端 MCP（選用）

1. 讀取 `catalog/google-workspace-profiles.json`，說明 Drive、Calendar、Gmail、People、Chat 各是獨立遠端 MCP；一次只選一個 profile，預設建議 `drive-readonly`。
2. 先以不寫入模式執行 `node scripts/google-workspace-mcp.mjs --profile <profile> --project <PROJECT_ID>`，讓使用者看見要啟用的 Google API、MCP API、OAuth scopes 與端點。
3. 說明此流程需要 Google Cloud 專案、gcloud、OAuth 同意畫面與 OAuth Web client。OAuth client secret 一律由使用者在 Google Cloud／provider 安全設定介面輸入，禁止寫進專案或聊天。
4. 使用者明確確認後，才以 `--apply --confirm ENABLE_GOOGLE_WORKSPACE_MCP` 啟用該 profile 的服務；不要替使用者建立 Cloud 專案或猜測 project ID。
5. 依 provider 加入對應遠端 HTTPS MCP endpoint。Antigravity、Claude.ai／Claude Desktop 可依 Google 官方 OAuth connector 指引設定；其他 client 只有在確定支援 HTTP OAuth MCP 時才設定。
6. 在 provider 完成 OAuth 後，先做 profile 規定的唯讀驗證。Gmail 草稿、Calendar 建立活動、Drive 上傳／分享、Chat 發文都屬額外外部寫入，仍須逐次確認。
7. 在 Wiki 的 `decisions.md`、`qa.md` 與 `.agent-foundation/install-log.json` 記錄 profile、已核准 scopes、驗證結果與撤除方式；不得記錄 OAuth secret、授權碼或可識別資料。
