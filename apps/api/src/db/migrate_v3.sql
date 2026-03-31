-- Migration v3: 為 categories 表新增 required_fields 欄位
-- 用途：根據 service_type 定義每個服務需要的動態表單欄位
-- 格式：JSON 陣列，例如 '["link","quantity"]' 或 '["link","comments","rating"]'

ALTER TABLE categories ADD COLUMN required_fields TEXT DEFAULT '["link","quantity"]';

-- 為 order_items 表新增 extra_data 欄位，儲存動態表單的額外資料
ALTER TABLE order_items ADD COLUMN extra_data TEXT;

-- 根據 service_type 批量更新 required_fields
-- Comments (留言) → 需要 link + comments
UPDATE categories SET required_fields = '["link","comments"]'
WHERE service_type = 'Comments';

-- Reviews (評論/評價) → 需要 link + comments + rating
UPDATE categories SET required_fields = '["link","comments","rating"]'
WHERE service_type = 'Reviews';

-- Votes (投票) → 需要 link + quantity + answer_number
UPDATE categories SET required_fields = '["link","quantity","answer_number"]'
WHERE service_type = 'Votes';

-- Mentions (提及/標記) → 需要 link + quantity + usernames
UPDATE categories SET required_fields = '["link","quantity","usernames"]'
WHERE service_type = 'Mentions';

-- Accounts (帳號) → 只需要 quantity
UPDATE categories SET required_fields = '["quantity"]'
WHERE service_type = 'Accounts';

-- Packages (套餐) → 只需要 link
UPDATE categories SET required_fields = '["link"]'
WHERE service_type = 'Packages';

-- Posts (貼文代發) → 需要 link + comments
UPDATE categories SET required_fields = '["link","comments"]'
WHERE service_type = 'Posts';

-- Live Viewers (直播觀眾) → link + quantity（持續時間已內建在服務名稱中）
-- 保持預設 ["link","quantity"] 即可

-- Traffic (流量) → link + quantity（國家已內建在服務名稱中）
-- 保持預設 ["link","quantity"] 即可

-- Followers, Likes, Views, Shares, Saves, Stories, Other
-- 保持預設 ["link","quantity"] 即可
