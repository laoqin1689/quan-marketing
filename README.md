# 全行銷 SMM Panel

社群行銷服務平台 — 基於 Cloudflare + N8N + Next.js 的三大支柱架構。

## 架構概覽

| 支柱 | 技術 | 用途 |
| :--- | :--- | :--- |
| **運行環境** | Cloudflare (Pages + Workers + D1 + KV + Queues) | 前後端託管、資料庫、快取、任務佇列 |
| **自動化流程** | N8N | 供應商故障轉移、棄單提醒、CAPI 回傳、健康檢查 |
| **源碼管理** | GitHub | CI/CD 自動部署 |

## 項目結構

```
quan-marketing/
├── apps/
│   ├── web/          # Next.js 前端 (Cloudflare Pages)
│   └── api/          # Hono 後端 API (Cloudflare Workers)
├── packages/
│   └── shared/       # 共用型別與工具
├── n8n-workflows/    # N8N 工作流程 JSON
└── docs/             # 文件
```

## 開發指令

```bash
pnpm install          # 安裝所有依賴
pnpm dev:web          # 啟動前端開發伺服器
pnpm dev:api          # 啟動後端開發伺服器
pnpm build:web        # 建構前端
pnpm build:api        # 建構後端
pnpm deploy:api       # 部署 Workers API
```

## 環境變數

請參考 `.env.example` 設定必要的環境變數。
