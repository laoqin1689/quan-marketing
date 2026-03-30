-- ============================================================
-- 全行銷 SMM Panel — Cloudflare D1 Database Schema
-- ============================================================

-- 用戶表：儲存匿名用戶與已識別用戶
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    anonymous_id    TEXT NOT NULL UNIQUE,
    email           TEXT,
    phone           TEXT,
    first_touch_utm TEXT,          -- JSON: 首次觸點 UTM 參數
    last_touch_utm  TEXT,          -- JSON: 最近觸點 UTM 參數
    member_level    TEXT DEFAULT 'basic',  -- basic / silver / gold / vip
    total_spent     REAL DEFAULT 0,
    order_count     INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_anonymous_id ON users(anonymous_id);

-- 產品分類表
CREATE TABLE IF NOT EXISTS categories (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    platform        TEXT NOT NULL,       -- Instagram, Facebook, YouTube, TikTok, etc.
    service_type    TEXT NOT NULL,       -- Followers, Likes, Views, Comments, etc.
    quality         TEXT NOT NULL,       -- Premium, HQ, Standard, Economy, Bot/Low
    region          TEXT DEFAULT 'Global', -- Global, TW, Targeted
    display_name    TEXT NOT NULL,       -- 前台顯示名稱
    description     TEXT,
    base_price_twd  REAL NOT NULL,      -- 基礎價格 (TWD per 1000)
    min_quantity    INTEGER DEFAULT 100,
    max_quantity    INTEGER DEFAULT 100000,
    is_active       INTEGER DEFAULT 1,
    sort_order      INTEGER DEFAULT 0,
    created_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_categories_platform ON categories(platform);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- 供應商表
CREATE TABLE IF NOT EXISTS suppliers (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL UNIQUE,
    api_url         TEXT NOT NULL,
    api_key         TEXT NOT NULL,
    is_active       INTEGER DEFAULT 1,
    health_status   TEXT DEFAULT 'healthy',  -- healthy / degraded / down
    last_health_check TEXT,
    avg_response_time_ms INTEGER DEFAULT 0,
    success_rate    REAL DEFAULT 100.0,
    created_at      TEXT DEFAULT (datetime('now'))
);

-- 供應商路由表：每個產品分類對應的供應商優先順序
CREATE TABLE IF NOT EXISTS supplier_routes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id        TEXT NOT NULL,        -- e.g. RT-0134
    category_id     INTEGER REFERENCES categories(id),
    priority        INTEGER NOT NULL,     -- 1=主供應商, 2=備選1, 3=備選2...
    supplier_id     INTEGER REFERENCES suppliers(id),
    supplier_service_id TEXT NOT NULL,    -- 供應商端的服務 ID
    cost_per_1k     REAL NOT NULL,       -- 成本 (USD per 1000)
    score           REAL DEFAULT 0,       -- 綜合評分
    has_refill      INTEGER DEFAULT 0,
    min_order       INTEGER DEFAULT 1,
    max_order       INTEGER DEFAULT 1000000,
    is_active       INTEGER DEFAULT 1,
    created_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_routes_category ON supplier_routes(category_id);
CREATE INDEX IF NOT EXISTS idx_routes_route_id ON supplier_routes(route_id);
CREATE INDEX IF NOT EXISTS idx_routes_priority ON supplier_routes(category_id, priority);

-- 訂單表
CREATE TABLE IF NOT EXISTS orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number    TEXT NOT NULL UNIQUE,
    user_id         INTEGER REFERENCES users(id),
    status          TEXT NOT NULL DEFAULT 'pending',
    -- pending / awaiting_payment / paid / processing / in_progress / partial / completed / cancelled / refunded
    total_amount    REAL NOT NULL,
    currency        TEXT DEFAULT 'TWD',
    payment_method  TEXT,
    -- 社群帳號資訊
    social_account  TEXT NOT NULL,       -- 用戶的社群帳號/連結
    social_platform TEXT NOT NULL,       -- Instagram, Facebook, etc.
    -- 歸因欄位
    utm_source      TEXT,
    utm_medium      TEXT,
    utm_campaign    TEXT,
    utm_term        TEXT,
    utm_content     TEXT,
    fbclid          TEXT,
    gclid           TEXT,
    ttclid          TEXT,
    ref_code        TEXT,               -- 推薦碼
    coupon_code     TEXT,               -- 優惠碼
    discount_amount REAL DEFAULT 0,
    -- 供應商處理
    supplier_id     INTEGER REFERENCES suppliers(id),
    supplier_order_id TEXT,
    supplier_status TEXT,
    -- CAPI 回傳狀態
    fb_capi_sent    INTEGER DEFAULT 0,
    google_api_sent INTEGER DEFAULT 0,
    tiktok_api_sent INTEGER DEFAULT 0,
    -- 時間戳
    created_at      TEXT DEFAULT (datetime('now')),
    paid_at         TEXT,
    completed_at    TEXT,
    -- 匿名追蹤
    anonymous_id    TEXT,
    ip_address      TEXT,
    user_agent      TEXT
);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_utm ON orders(utm_source, utm_medium);

-- 訂單項目表
CREATE TABLE IF NOT EXISTS order_items (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id        INTEGER REFERENCES orders(id),
    category_id     INTEGER REFERENCES categories(id),
    service_name    TEXT NOT NULL,
    quantity        INTEGER NOT NULL,
    unit_price      REAL NOT NULL,       -- TWD per unit
    subtotal        REAL NOT NULL,
    -- 供應商處理
    supplier_id     INTEGER REFERENCES suppliers(id),
    supplier_order_id TEXT,
    supplier_status TEXT DEFAULT 'pending',
    start_count     INTEGER,
    current_count   INTEGER,
    remains         INTEGER
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 優惠碼表
CREATE TABLE IF NOT EXISTS coupons (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    code            TEXT NOT NULL UNIQUE,
    discount_type   TEXT NOT NULL,       -- 'percentage' 或 'fixed'
    discount_value  REAL NOT NULL,
    min_order_amount REAL DEFAULT 0,
    max_uses        INTEGER,
    current_uses    INTEGER DEFAULT 0,
    utm_source      TEXT,               -- 綁定特定廣告來源
    valid_from      TEXT,
    valid_until     TEXT,
    is_active       INTEGER DEFAULT 1,
    created_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- 推薦人表
CREATE TABLE IF NOT EXISTS affiliates (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER REFERENCES users(id),
    ref_code        TEXT NOT NULL UNIQUE,
    commission_rate REAL DEFAULT 0.10,       -- 10%
    l2_commission_rate REAL DEFAULT 0.02,    -- 2%
    total_earnings  REAL DEFAULT 0,
    pending_balance REAL DEFAULT 0,
    available_balance REAL DEFAULT 0,
    parent_affiliate_id INTEGER REFERENCES affiliates(id),
    created_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_affiliates_ref_code ON affiliates(ref_code);

-- 推薦佣金記錄表
CREATE TABLE IF NOT EXISTS commissions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    affiliate_id    INTEGER REFERENCES affiliates(id),
    order_id        INTEGER REFERENCES orders(id),
    level           INTEGER DEFAULT 1,   -- 1=直接推薦, 2=間接推薦
    amount          REAL NOT NULL,
    status          TEXT DEFAULT 'pending', -- pending / approved / paid
    created_at      TEXT DEFAULT (datetime('now'))
);

-- 用戶接觸點歷史表
CREATE TABLE IF NOT EXISTS user_touchpoints (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER REFERENCES users(id),
    anonymous_id    TEXT NOT NULL,
    utm_source      TEXT,
    utm_medium      TEXT,
    utm_campaign    TEXT,
    utm_term        TEXT,
    utm_content     TEXT,
    click_id        TEXT,
    click_id_type   TEXT,               -- 'fbclid', 'gclid', 'ttclid'
    referrer_url    TEXT,
    landing_page    TEXT,
    ip_address      TEXT,
    user_agent      TEXT,
    touched_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_touchpoints_user ON user_touchpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_touchpoints_anon ON user_touchpoints(anonymous_id);

-- 事件日誌表（用於追蹤與分析）
CREATE TABLE IF NOT EXISTS events (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    anonymous_id    TEXT NOT NULL,
    user_id         INTEGER,
    event_name      TEXT NOT NULL,       -- page_view, view_content, add_to_cart, checkout, purchase
    properties      TEXT,               -- JSON
    utm_source      TEXT,
    utm_medium      TEXT,
    utm_campaign    TEXT,
    page_url        TEXT,
    referrer        TEXT,
    ip_address      TEXT,
    user_agent      TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_anon ON events(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);

-- 管理員表
CREATE TABLE IF NOT EXISTS admins (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    username        TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            TEXT DEFAULT 'admin',
    created_at      TEXT DEFAULT (datetime('now'))
);

-- 系統設定表
CREATE TABLE IF NOT EXISTS settings (
    key             TEXT PRIMARY KEY,
    value           TEXT NOT NULL,
    updated_at      TEXT DEFAULT (datetime('now'))
);

-- 付款記錄表
CREATE TABLE IF NOT EXISTS payments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id        INTEGER REFERENCES orders(id),
    payment_method  TEXT NOT NULL,       -- ecpay_credit / ecpay_atm / newebpay
    transaction_id  TEXT,
    amount          REAL NOT NULL,
    currency        TEXT DEFAULT 'TWD',
    status          TEXT DEFAULT 'pending', -- pending / success / failed
    raw_response    TEXT,               -- JSON: 金流回傳原始資料
    created_at      TEXT DEFAULT (datetime('now')),
    completed_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id);
