# 全行銷 — 部署指南

## 前置需求

1. **Cloudflare 帳號**（免費方案即可）
2. **GitHub 帳號**（laoqin1689）
3. **N8N 實例**（自架或 n8n.cloud）

## 第一步：Cloudflare 設定

### 1.1 建立 D1 資料庫

```bash
# 安裝 wrangler CLI
npm install -g wrangler

# 登入 Cloudflare
wrangler login

# 建立 D1 資料庫
wrangler d1 create quan-marketing-db

# 記下回傳的 database_id，更新 apps/api/wrangler.toml
```

### 1.2 建立 KV Namespace

```bash
wrangler kv:namespace create CACHE
# 記下回傳的 id，更新 apps/api/wrangler.toml
```

### 1.3 執行資料庫 Schema

```bash
cd apps/api

# 建立資料表
wrangler d1 execute quan-marketing-db --file=src/db/schema.sql --remote

# 匯入種子資料
wrangler d1 execute quan-marketing-db --file=src/db/seed.sql --remote
```

### 1.4 設定 Workers 環境變數

```bash
# 管理員帳密
wrangler secret put ADMIN_USERNAME
wrangler secret put ADMIN_PASSWORD

# N8N Webhook URL
wrangler secret put N8N_WEBHOOK_BASE_URL
```

### 1.5 建立 Cloudflare Pages 專案

```bash
wrangler pages project create quan-marketing
```

## 第二步：GitHub Secrets 設定

在 GitHub repo Settings → Secrets and variables → Actions 中新增：

| Secret 名稱 | 說明 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token（需有 Workers/Pages/D1 權限） |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
| `API_BASE_URL` | Workers API 的 URL，例如 `https://quan-marketing-api.xxx.workers.dev` |

## 第三步：部署

```bash
# 推送到 main 分支即自動部署
git push origin main
```

GitHub Actions 會自動：
1. 建置 Next.js 前端 → 部署到 Cloudflare Pages
2. 部署 Hono API → Cloudflare Workers
3. 如有 Schema 變更 → 自動執行 D1 Migration

## 第四步：N8N 工作流程匯入

1. 開啟 N8N 管理介面
2. 點選 Import from file
3. 依序匯入 `n8n-workflows/` 目錄下的 4 個 JSON 檔案：
   - `01-supplier-failover.json` — 供應商故障轉移下單
   - `02-abandoned-cart-reminder.json` — 棄單提醒流程
   - `03-capi-conversion-tracking.json` — CAPI 轉換回傳
   - `04-supplier-health-check.json` — 供應商健康檢查

4. 設定 N8N 環境變數：

| 變數名稱 | 說明 |
|---|---|
| `API_BASE_URL` | Workers API URL |
| `ADMIN_EMAIL` | 管理員通知 Email |
| `FB_PIXEL_ID` | Facebook Pixel ID |
| `FB_CAPI_TOKEN` | Facebook CAPI Access Token |
| `GA_MEASUREMENT_ID` | Google Analytics Measurement ID |
| `GA_API_SECRET` | Google Analytics API Secret |
| `TIKTOK_PIXEL_ID` | TikTok Pixel ID |
| `TIKTOK_ACCESS_TOKEN` | TikTok Events API Access Token |

5. 設定 N8N Credentials：
   - 建立 HTTP Header Auth credential（名稱：`Admin API Auth`），Header Name: `Authorization`，Value: `Bearer <admin_token>`

6. 啟用所有工作流程

## 第五步：金流串接（ECPay）

1. 申請 ECPay 商店帳號
2. 在 ECPay 後台設定回調 URL：`https://quan-marketing-api.xxx.workers.dev/api/webhooks/payment`
3. 在 Workers 環境變數中設定 ECPay 相關金鑰

## 網址

| 服務 | URL |
|---|---|
| 前台 | `https://quan-marketing.pages.dev` |
| API | `https://quan-marketing-api.xxx.workers.dev` |
| 管理後台 | `https://quan-marketing.pages.dev/admin/` |
| GitHub | `https://github.com/laoqin1689/quan-marketing` |
