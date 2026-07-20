# Google Workspace API 引導工作流

Google Workspace API 與遠端 MCP 是兩條不同路徑：MCP 讓支援 OAuth 的 Agent client 呼叫 Google 的遠端工具；API profile 則是為 Docs、Slides、Sheets、Forms、Apps Script 與 Classroom 準備的使用者自有整合。不得因為 API 已啟用，就宣稱 Agent 已經可以直接呼叫它。

## 最簡單的選擇順序

1. 先問：「只需要本機產出物，還是需要建立 Google 資源連結？」只需要本機產出時，不安裝 `gcloud`、不啟用 API。
2. 需要連結時，先選一個 API profile。建立 Docs／Slides／Sheets／Forms 都是外部寫入；Classroom 第一版只支援課程唯讀；Apps Script 僅限既有 API executable 的進階案例。
3. 問：「要用 Cloud Console 手動啟用，還是讓 Agent 協助以 `gcloud` 啟用？」預設是 Console；只有後者才建議安裝 Google Cloud CLI。
4. 先執行 dry run：`node scripts/google-workspace-api.mjs --profile <profile> --project <PROJECT_ID>`。說明服務、scope、用途、第一次驗證、Console URL 與可選的 CLI 指令。
5. Cloud Console 模式由使用者自己點選「啟用」。CLI 模式在使用者確認後，才執行 `--apply --confirm ENABLE_GOOGLE_WORKSPACE_API`；再由使用者在本機完成 OAuth。任何 client secret、refresh token 或學生資料都不能進對話、Git 或 Wiki。
6. 先完成 profile 的最小驗證。要建立 Docs／Slides／Sheets／Forms 空白資源時，先展示本機草稿、標題、目標服務、可見範圍和分享設定，取得一次明確確認後才執行 `google-workspace-resource.mjs --apply --confirm CREATE_GOOGLE_WORKSPACE_RESOURCE`。取得 ID 後，腳本只輸出編輯連結；將連結、commit 與人工確認回寫 `outputs.md` 和 `qa.md`。

## gcloud 的定位

- **不必安裝**：使用 Cloud Console 手動啟用一個 API，或只產生本機 DOCX／PPTX／HTML。
- **建議安裝**：要讓 Agent 用可重現指令啟用多個 API、使用本機 OAuth application-default login、或建立並追蹤 Workspace 資源連結。
- 先執行 `node scripts/google-cloud-cli.mjs`；macOS 偵測到 Homebrew 時會提供官方 Homebrew 安裝建議，但 Agent 必須在使用者確認後才執行安裝。

## 不在第一版自動化的事項

- 將任意 Markdown 自動轉成完整 Google Slides／Forms 題目或同步既有學校資料，需要另外的 API bridge 與內容 mapping，不能靠「啟用 API」假裝完成。
- Apps Script 執行需要共同的 standard Cloud project、既有 API executable、目標 script 自行宣告的 scopes；不自動建立、修改或執行 Script。
- Classroom 的名冊、學生作業、成績、課程建立、教材發布均不屬初始 profile。若日後要加入，必須做專用資料治理與教師／學校管理員確認。
