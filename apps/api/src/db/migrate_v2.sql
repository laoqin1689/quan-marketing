-- Migration v2: 為 categories 表新增缺少的欄位
-- 現有欄位：id, platform, service_type, quality, region, display_name, description,
--           base_price_twd, min_quantity, max_quantity, is_active, sort_order, created_at
-- 缺少：delivery_estimate, has_warranty, is_popular

ALTER TABLE categories ADD COLUMN delivery_estimate TEXT DEFAULT '0-24 小時';
ALTER TABLE categories ADD COLUMN has_warranty INTEGER DEFAULT 0;
ALTER TABLE categories ADD COLUMN is_popular INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_categories_popular ON categories(is_popular);
