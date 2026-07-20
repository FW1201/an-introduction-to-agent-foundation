# 環境設定工作流

1. 先辨識作業系統與 Agent provider。
2. 執行 `node scripts/doctor.mjs --json`；Node 不存在時，改執行對應 bootstrap 診斷腳本。
3. 依 `catalog/environment.json` 只列出目前階段需要的缺項。
4. 每一項補安裝前，說明用途、官方來源、影響與驗證命令，等待確認。
5. 完成安裝後重跑 doctor；不要只因命令成功就標示完成。
6. 將結果寫入 `.agent-foundation/install-log.json` 與 progress。

GitHub CLI 只在建立 repo 或部署前要求 `gh auth login`。OfficeCLI、Python、瀏覽器工具都屬選用能力。
