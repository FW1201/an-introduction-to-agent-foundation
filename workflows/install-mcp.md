# MCP 安裝工作流

1. 依 `catalog/mcps.json` 解釋 MCP 的工具、權限、來源、驗證與移除方式。
2. 先檢查 Agent 是否已具有原生同等能力；有則不重複安裝。
3. filesystem MCP 只允許目前 workspace，初次驗證只執行 list/read。
4. 先備份 provider 設定，顯示設定 diff，取得確認後才合併。
5. 重啟／重新載入 Agent，完成 initialize 與無害 tool call。
6. GitHub、瀏覽器等外部工具在需要時再安裝，外部寫入仍需逐次確認。

Google Workspace 不屬此工作流；需要時改讀 `workflows/google-workspace-cli.md`，使用單一 `gws` 終端機工具。
