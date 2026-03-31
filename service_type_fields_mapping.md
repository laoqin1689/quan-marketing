# 服務類型 → 表單欄位映射

## 研究來源
- MarketerPanel API 參數文檔（SMM Panel 標準 API）
- HDZ Bulk 服務列表（hdzbulk-services.csv）
- 路由表（routing_table_v2.csv）中的 service_type 分類

## SMM Panel 標準 API 訂單類型

| Order Type | Required Parameters |
|---|---|
| Default | link, quantity |
| Custom Comments | link, comments |
| Custom Comments Package | link, comments |
| SEO | link, quantity, keywords |
| Poll | link, quantity, answer_number |
| Mentions | link, quantity, usernames |
| Comment Replies | link, username, comments |
| Web Traffic | quantity, country, device, type_of_traffic |
| Subscriptions | username, min, max, delay |
| Package | link |

## 我們的 service_type 對應的表單欄位

### 1. Followers (粉絲/追蹤)
- **link**: 帳號/頁面連結（必填）
- **quantity**: 數量（必填）
- 對應 API type: Default

### 2. Likes (按讚/愛心)
- **link**: 貼文/影片連結（必填）
- **quantity**: 數量（必填）
- 對應 API type: Default

### 3. Views (觀看)
- **link**: 影片連結（必填）
- **quantity**: 數量（必填）
- 對應 API type: Default

### 4. Comments (留言)
- **link**: 貼文連結（必填）
- **comments**: 留言內容（必填，多條以換行分隔）
- 對應 API type: Custom Comments

### 5. Shares (分享/轉發)
- **link**: 貼文連結（必填）
- **quantity**: 數量（必填）
- 對應 API type: Default

### 6. Live Viewers (直播觀眾)
- **link**: 直播連結（必填）
- **quantity**: 數量（必填）
- 注意：持續時間已內建在服務名稱中（30/60/90/120分鐘等）
- 對應 API type: Default

### 7. Reviews (評論/評價) — 特別是 Google Maps
- **link**: 商家連結（必填）
- **comments**: 評論內容（必填，多條以換行分隔）
- **rating**: 星級 1-5（選填，預設5星）
- 對應 API type: Custom Comments + 額外 rating

### 8. Traffic (流量)
- **link**: 網站 URL（必填）
- **quantity**: 數量（必填）
- **country**: 國家/地區（選填，部分服務已內建）
- 對應 API type: Web Traffic (simplified)

### 9. Votes (投票)
- **link**: 投票連結（必填）
- **quantity**: 數量（必填）
- **answer_number**: 投票選項編號（必填）
- 對應 API type: Poll

### 10. Saves (收藏)
- **link**: 貼文連結（必填）
- **quantity**: 數量（必填）
- 對應 API type: Default

### 11. Mentions (提及/標記)
- **link**: 貼文連結（必填）
- **quantity**: 數量（必填）
- **usernames**: 用戶名列表（必填，多個以換行分隔）
- 對應 API type: Mentions

### 12. Stories (限時動態)
- **link**: 帳號連結（必填）
- **quantity**: 數量（必填）
- 對應 API type: Default

### 13. Accounts (帳號)
- **quantity**: 數量（必填）
- 對應 API type: Default (no link needed)

### 14. Packages (套餐)
- **link**: 帳號連結（必填）
- 對應 API type: Package

### 15. Posts (貼文)
- **link**: 帳號/版面連結（必填）
- **comments**: 貼文內容（必填）
- 對應 API type: Custom Comments

### 16. Other (其他)
- **link**: 連結（必填）
- **quantity**: 數量（必填）
- 對應 API type: Default

## 欄位定義（前端 JSON Schema）

```json
{
  "link": {
    "type": "text",
    "label": "連結 / 帳號",
    "placeholder": "依平台不同",
    "required": true
  },
  "quantity": {
    "type": "number",
    "label": "數量",
    "required": true
  },
  "comments": {
    "type": "textarea",
    "label": "留言/評論內容",
    "placeholder": "每行一條留言",
    "required": true,
    "hint": "每行輸入一條留言，系統會隨機選取"
  },
  "rating": {
    "type": "select",
    "label": "星級評分",
    "options": [
      {"value": "5", "label": "★★★★★ 5星"},
      {"value": "4", "label": "★★★★☆ 4星"},
      {"value": "3", "label": "★★★☆☆ 3星"},
      {"value": "2", "label": "★★☆☆☆ 2星"},
      {"value": "1", "label": "★☆☆☆☆ 1星"}
    ],
    "default": "5",
    "required": false
  },
  "answer_number": {
    "type": "select",
    "label": "投票選項",
    "options": [
      {"value": "1", "label": "選項 1"},
      {"value": "2", "label": "選項 2"},
      {"value": "3", "label": "選項 3"},
      {"value": "4", "label": "選項 4"}
    ],
    "required": true
  },
  "usernames": {
    "type": "textarea",
    "label": "用戶名列表",
    "placeholder": "每行一個用戶名",
    "required": true
  },
  "keywords": {
    "type": "textarea",
    "label": "關鍵字",
    "placeholder": "每行一個關鍵字",
    "required": true
  },
  "country": {
    "type": "select",
    "label": "國家/地區",
    "required": false
  }
}
```

## required_fields JSON 格式（存入 categories 表）

每個 category 的 required_fields 欄位存放 JSON 陣列，定義該服務需要的額外欄位：

- `["link","quantity"]` — 預設（粉絲、按讚、觀看、分享、收藏、限時動態、其他）
- `["link","comments"]` — 留言類
- `["link","comments","rating"]` — Google Maps 評論
- `["link","quantity","answer_number"]` — 投票
- `["link","quantity","usernames"]` — 提及/標記
- `["link","quantity","keywords"]` — SEO 類
- `["link"]` — 套餐
- `["quantity"]` — 帳號類
- `["link","comments"]` — 貼文代發
