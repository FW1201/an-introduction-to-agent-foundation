# Google Workspace CLI 工作流

本專案的 Google Workspace 操作統一使用 [`googleworkspace/cli`](https://github.com/googleworkspace/cli) 提供的 `gws`。它透過終端機執行並輸出 JSON，不需要在 Agent provider 另外設定 Google 連接器，也不保留自製 API bridge。

## 最短、安全的入門路徑

1. 先確認任務是否真的需要 Google Workspace。只需要本機 DOCX、PPTX、PDF、HTML 或 Wiki 成果時，不安裝 `gws`。
2. 執行 `npm run google-workspace:check`。這只檢查 `gws` 是否存在，不登入、不呼叫 API，也不修改設定。
3. 若缺少 `gws`，先說明來源、影響、驗證與移除方式；使用者確認後才執行本模板已驗證的 `npm install -g @googleworkspace/cli@0.22.5`，再以 `gws --version` 驗證並記錄實際版本。上游在 1.0 前且不是 Google 正式支援產品，版本不同時先重跑相容性檢查。
4. 由使用者在 Google Cloud Console 選定自己的專案，透過 [API Library](https://console.cloud.google.com/apis/library) 啟用這次需要的單一 Workspace API，再到 [OAuth 同意畫面](https://console.cloud.google.com/apis/credentials/consent) 完成設定並把自己加入測試使用者。
5. 在 [Credentials](https://console.cloud.google.com/apis/credentials) 建立 **Desktop app** OAuth client，將下載的檔案直接存到 `~/.config/gws/client_secret.json`。不得把檔案內容貼進對話、專案、Wiki 或 log。
6. 第一次只授權單一服務的唯讀範圍：

   ```bash
   gws auth login --readonly -s drive
   ```

7. 登入後先做一次最小唯讀驗證：

   ```bash
   gws auth status
   gws drive files list --params '{"pageSize":1,"fields":"files(id,mimeType)"}'
   ```

8. `auth status` 需顯示有效登入與預期 scopes，唯讀呼叫需回傳有效 JSON 且資料範圍符合預期，才能在 `qa.md` 標記 `gws` 的 Drive 唯讀能力可用。兩個命令的原始輸出都不得複製到聊天、log 或 Wiki；只記錄 auth method、token-valid、scope 名稱與去識別結果。

## 新服務與寫入

- 新服務先執行 `gws <service> --help`；實際方法再用 `gws schema <service>.<resource>.<method>` 檢查參數，不憑記憶猜命令。
- 需要 Gmail、Calendar 或其他服務時，重新以 `--readonly -s <service>` 限定第一次授權；不得一次要求所有服務。
- 要從唯讀升級為寫入時，先從 `catalog/google-workspace-cli.json` 選定該次操作的單一完整 scope URL，展示用途並取得授權升級確認，再執行 `gws auth login --scopes <完整 scope URL> -s <service>`。不得使用全服務或全 scope 模式。
- 建立、更新、上傳、分享、寄送、發布與刪除都屬外部寫入。先完成本機草稿與 QA，再展示目標、參數、可見範圍、預期副作用與回復方式。
- 先加上 `--dry-run` 檢查請求。原始 request body 可能含內容、收件者或其他敏感資料，不得貼進聊天或寫入紀錄；只展示與保存去識別摘要。使用者針對該次操作明確確認後，才移除 `--dry-run` 執行。
- HTTP 成功或回傳 ID 不等於完成。寫入後必須再讀回標題、內容摘要、擁有者／目標位置、分享或寄送狀態等關鍵欄位；語意不符就標記失敗。
- 寄送郵件、分享檔案、公開發布與刪除永遠是分開的確認點，不能由「建立文件」的同意推定。

## Wiki 與撤除

- `decisions.md`：記錄為何需要 `gws`、選定服務、唯讀／寫入範圍與人工確認。
- `qa.md`：記錄版本、實際驗證命令、去識別 dry-run 摘要、語意讀回與人工檢查。
- `outputs.md`：只記錄安全的資源連結、版本與結果；不保存 token、OAuth client、郵件內容或可識別學生資料。
- `.agent-foundation/install-log.json`：把 `gws` 記在 environment，保存來源、版本、核准的 scope 名稱與去識別驗證狀態；不得記為 MCP，也不得存完整 `auth status` 或 API 回應。
- 禁止使用會把未遮蔽 credentials 輸出到終端機的 `gws auth export --unmasked`。
- 不再需要本機授權時，經使用者確認後執行 `gws auth logout`。要移除工具時執行 `npm uninstall -g @googleworkspace/cli`；是否撤銷 Google 帳號授權由使用者在帳號安全設定中另行確認。
