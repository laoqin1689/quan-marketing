-- ============================================================
-- 全行銷 SMM Panel — Seed Data
-- ============================================================

-- 管理員帳號 (密碼請透過環境變數設定)
INSERT OR IGNORE INTO admins (username, password_hash, role) VALUES ('admin', 'change_me', 'admin');

-- 系統設定
INSERT OR REPLACE INTO settings (key, value) VALUES ('site_name', '全行銷');
INSERT OR REPLACE INTO settings (key, value) VALUES ('site_currency', 'TWD');
INSERT OR REPLACE INTO settings (key, value) VALUES ('default_commission_rate', '0.10');
INSERT OR REPLACE INTO settings (key, value) VALUES ('abandoned_cart_timeout_minutes', '30');

-- ==================== 供應商 ====================
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('JustAnotherPanel', 'https://justanotherpanel.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('URPanel', 'https://urpanel.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('SMMlite', 'https://smmlite.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('777fans', 'https://777fans.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('Peakerr', 'https://peakerr.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('StarAds', 'https://starads.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('AutoBuyFans', 'https://autobuyfans.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('FBigLikes', 'https://fbiglikes.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('HDZ Bulk', 'https://hdzbulk.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('FansKing', 'https://fansking.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('Taiwan Like', 'https://taiwanlike.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('AI-FANS', 'https://ai-fans.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('GodLikes', 'https://godlikes.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('SocialKing', 'https://socialking.com/api/v2', 'YOUR_API_KEY');
INSERT OR IGNORE INTO suppliers (name, api_url, api_key) VALUES ('SMMRush', 'https://smmrush.com/api/v2', 'YOUR_API_KEY');

-- ==================== 產品分類（前台展示用） ====================

-- Instagram 服務
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Instagram', 'Followers', 'Economy', 'Global', 'IG 粉絲 - 經濟方案', '快速增加粉絲數，適合預算有限的用戶。無保固，可能有少量掉落。', 15, 100, 100000, 1);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Instagram', 'Followers', 'Standard', 'Global', 'IG 粉絲 - 標準方案', '穩定的粉絲增長，混合帳號，性價比最高。', 35, 100, 50000, 2);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Instagram', 'Followers', 'HQ', 'Global', 'IG 粉絲 - 高品質方案', '真實帳號粉絲，有頭像和貼文，含 30 天保固。', 65, 50, 20000, 3);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Instagram', 'Followers', 'Premium', 'Global', 'IG 粉絲 - 真人精選', '100% 真人活躍帳號，永久保固，最高品質。', 150, 50, 10000, 4);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Instagram', 'Followers', 'Premium', 'TW', 'IG 粉絲 - 台灣真人', '台灣本地真人帳號，適合在地品牌經營。', 350, 50, 5000, 5);

INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Instagram', 'Likes', 'Economy', 'Global', 'IG 愛心 - 經濟方案', '快速增加貼文愛心數。', 8, 50, 50000, 10);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Instagram', 'Likes', 'Standard', 'Global', 'IG 愛心 - 標準方案', '穩定的愛心增長，不掉落。', 18, 50, 30000, 11);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Instagram', 'Likes', 'HQ', 'Global', 'IG 愛心 - 高品質方案', '真實帳號愛心，提升貼文觸及率。', 35, 50, 20000, 12);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Instagram', 'Likes', 'Premium', 'TW', 'IG 愛心 - 台灣真人', '台灣真人帳號按讚。', 250, 50, 5000, 13);

INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Instagram', 'Views', 'Standard', 'Global', 'IG Reels 觀看 - 標準方案', '增加 Reels 短影音觀看次數。', 5, 500, 1000000, 20);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Instagram', 'Views', 'HQ', 'Global', 'IG Reels 觀看 - 高品質', '高留存率觀看，提升演算法推薦。', 12, 500, 500000, 21);

INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Instagram', 'Comments', 'Standard', 'Global', 'IG 留言 - 標準方案', '增加貼文留言互動。', 80, 10, 5000, 30);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Instagram', 'Comments', 'HQ', 'TW', 'IG 留言 - 台灣中文', '台灣帳號中文留言，看起來最自然。', 500, 10, 1000, 31);

-- Facebook 服務
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Facebook', 'Followers', 'Standard', 'Global', 'FB 粉專追蹤 - 標準方案', '增加粉絲專頁追蹤人數。', 30, 100, 50000, 1);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Facebook', 'Followers', 'HQ', 'Global', 'FB 粉專追蹤 - 高品質', '真實帳號追蹤，含保固。', 55, 100, 20000, 2);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Facebook', 'Likes', 'Standard', 'Global', 'FB 貼文讚 - 標準方案', '增加貼文按讚數。', 15, 50, 50000, 10);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Facebook', 'Views', 'Standard', 'Global', 'FB 影片觀看 - 標準方案', '增加影片觀看次數。', 8, 500, 1000000, 20);

-- YouTube 服務
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('YouTube', 'Followers', 'Standard', 'Global', 'YT 訂閱 - 標準方案', '增加頻道訂閱人數。', 45, 100, 50000, 1);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('YouTube', 'Followers', 'HQ', 'Global', 'YT 訂閱 - 高品質', '真實帳號訂閱，含保固。', 85, 50, 20000, 2);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('YouTube', 'Views', 'Standard', 'Global', 'YT 觀看 - 標準方案', '增加影片觀看次數。', 10, 500, 1000000, 10);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('YouTube', 'Likes', 'Standard', 'Global', 'YT 按讚 - 標準方案', '增加影片按讚數。', 20, 50, 50000, 20);

-- TikTok 服務
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('TikTok', 'Followers', 'Standard', 'Global', 'TikTok 粉絲 - 標準方案', '增加 TikTok 粉絲數。', 25, 100, 100000, 1);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('TikTok', 'Followers', 'HQ', 'Global', 'TikTok 粉絲 - 高品質', '真實帳號粉絲，含保固。', 55, 50, 20000, 2);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('TikTok', 'Views', 'Standard', 'Global', 'TikTok 觀看 - 標準方案', '增加短影音觀看次數。', 3, 500, 10000000, 10);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('TikTok', 'Likes', 'Standard', 'Global', 'TikTok 愛心 - 標準方案', '增加短影音愛心數。', 12, 50, 50000, 20);

-- Google 服務
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Google', 'Reviews', 'HQ', 'TW', 'Google 評論 - 台灣真人', '台灣真人帳號撰寫 Google 商家評論，含自訂內容。', 800, 5, 100, 1);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Google', 'Reviews', 'Standard', 'Global', 'Google 評論 - 標準方案', '增加 Google 商家五星評論。', 350, 5, 500, 2);

-- LINE 服務
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('LINE', 'Followers', 'HQ', 'TW', 'LINE 官方帳號好友 - 台灣', '增加 LINE 官方帳號好友數。', 200, 50, 10000, 1);

-- Threads 服務
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Threads', 'Followers', 'Standard', 'Global', 'Threads 粉絲 - 標準方案', '增加 Threads 粉絲數。', 30, 100, 50000, 1);
INSERT OR IGNORE INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order) VALUES
('Threads', 'Likes', 'Standard', 'Global', 'Threads 愛心 - 標準方案', '增加 Threads 愛心數。', 15, 50, 50000, 10);

-- ==================== 範例優惠碼 ====================
INSERT OR IGNORE INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, valid_until) VALUES
('NEW80', 'percentage', 20, 100, NULL, '2027-12-31');
INSERT OR IGNORE INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, valid_until) VALUES
('FIRST50', 'fixed', 50, 200, 1000, '2027-12-31');
INSERT OR IGNORE INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, valid_until) VALUES
('FB10', 'percentage', 10, 0, NULL, '2027-12-31');
INSERT OR IGNORE INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, utm_source, valid_until) VALUES
('TIKTOK15', 'percentage', 15, 0, NULL, 'tiktok', '2027-12-31');
