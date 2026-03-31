// ==================== Quality Labels & Descriptions ====================

export const QUALITY_LABELS: Record<string, { label: string; color: string; bg: string; border: string; desc: string }> = {
  'Bot/Low': {
    label: '超值版',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    desc: '價格最低，適合測試或預算極有限的情況。品質較不穩定，可能有較多掉落。',
  },
  'Economy': {
    label: '經濟版',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    desc: '速度快、價格低，適合預算有限的用戶。可能有少量掉落，不含保固。',
  },
  'Standard': {
    label: '標準版',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    desc: '性價比最高的選擇。品質穩定、速度適中，適合一般用途。部分服務含保固。',
  },
  'HQ': {
    label: '高品質',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    desc: '使用真實帳號外觀，安全性高。適合重視帳號安全的用戶，大部分含 30 天保固。',
  },
  'Premium': {
    label: '精選真人',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: '100% 真人活躍帳號，品質最高。適合品牌帳號與長期經營，含永久保固。',
  },
};

export const QUALITY_ORDER = ['Bot/Low', 'Economy', 'Standard', 'HQ', 'Premium'];

// ==================== Service Type Labels ====================

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  'Followers': '粉絲/追蹤',
  'Views': '觀看',
  'Likes': '按讚/愛心',
  'Comments': '留言',
  'Shares': '分享/轉發',
  'Traffic': '流量',
  'Live Viewers': '直播觀眾',
  'Reviews': '評論/評價',
  'Saves': '收藏',
  'Votes': '投票',
  'Mentions': '提及/標記',
  'Stories': '限時動態',
  'Accounts': '帳號',
  'Packages': '套餐',
  'Posts': '貼文',
  'Other': '其他',
};

// ==================== Platform Display Names ====================

export const PLATFORM_DISPLAY_NAMES: Record<string, string> = {
  'Instagram': 'Instagram',
  'Facebook': 'Facebook',
  'YouTube': 'YouTube',
  'TikTok': 'TikTok',
  'Threads': 'Threads',
  'Twitter/X': 'Twitter / X',
  'LINE': 'LINE',
  'Telegram': 'Telegram',
  'Snapchat': 'Snapchat',
  'Spotify': 'Spotify',
  'LinkedIn': 'LinkedIn',
  'Twitch': 'Twitch',
  'Google': 'Google',
  'Google Maps': 'Google Maps',
  'Website Traffic': '網站流量',
  'Crypto/NFT': 'Crypto / NFT',
  'SoundCloud': 'SoundCloud',
  'Quora': 'Quora',
  'Xiaohongshu': '小紅書',
  'Shopee': '蝦皮',
  'Reddit': 'Reddit',
  'Taiwan Forums': '台灣論壇',
  'Clubhouse': 'Clubhouse',
  'Pinterest': 'Pinterest',
  'Apple Music': 'Apple Music',
  'Dcard': 'Dcard',
  'Tumblr': 'Tumblr',
  'Vimeo': 'Vimeo',
  'Discord': 'Discord',
  'Shazam': 'Shazam',
  'Deezer': 'Deezer',
  'Other': '其他平台',
};

// ==================== Preset Package Quantities ====================

export const PRESET_QUANTITIES = [100, 500, 1000, 5000, 10000, 20000, 50000];

// ==================== Link Placeholder by Platform ====================

export const LINK_PLACEHOLDERS: Record<string, string> = {
  'Instagram': 'https://www.instagram.com/your_account',
  'Facebook': 'https://www.facebook.com/your_page',
  'YouTube': 'https://www.youtube.com/@your_channel',
  'TikTok': 'https://www.tiktok.com/@your_account',
  'Threads': 'https://www.threads.net/@your_account',
  'Twitter/X': 'https://x.com/your_account',
  'LINE': 'LINE 官方帳號 ID（例如 @yourshop）',
  'Telegram': 'https://t.me/your_channel',
  'Google': 'Google 商家連結',
  'Google Maps': 'Google Maps 商家連結',
};

// ==================== Dynamic Form Field Definitions ====================

export interface FieldConfig {
  type: 'text' | 'textarea' | 'select' | 'number';
  label: string;
  placeholder: string;
  required: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

// Field definitions for dynamic order forms
export const FIELD_DEFINITIONS: Record<string, FieldConfig> = {
  link: {
    type: 'text',
    label: '連結 / 帳號',
    placeholder: '請輸入您的社群帳號或連結',
    required: true,
    hint: '請確認帳號為公開狀態，以便服務正常交付',
  },
  quantity: {
    type: 'number',
    label: '數量',
    placeholder: '輸入數量',
    required: true,
  },
  comments: {
    type: 'textarea',
    label: '留言 / 評論內容',
    placeholder: '每行輸入一條留言\n例如：\n很棒的服務！\n推薦給大家\n非常滿意',
    required: true,
    hint: '每行一條留言，系統會隨機選取使用',
  },
  rating: {
    type: 'select',
    label: '星級評分',
    placeholder: '選擇星級',
    required: false,
    defaultValue: '5',
    options: [
      { value: '5', label: '★★★★★ 5星' },
      { value: '4', label: '★★★★☆ 4星' },
      { value: '3', label: '★★★☆☆ 3星' },
      { value: '2', label: '★★☆☆☆ 2星' },
      { value: '1', label: '★☆☆☆☆ 1星' },
    ],
  },
  answer_number: {
    type: 'select',
    label: '投票選項',
    placeholder: '選擇投票選項',
    required: true,
    options: [
      { value: '1', label: '選項 1' },
      { value: '2', label: '選項 2' },
      { value: '3', label: '選項 3' },
      { value: '4', label: '選項 4' },
      { value: '5', label: '選項 5' },
      { value: '6', label: '選項 6' },
    ],
  },
  usernames: {
    type: 'textarea',
    label: '用戶名列表',
    placeholder: '每行一個用戶名\n例如：\n@user1\n@user2\n@user3',
    required: true,
    hint: '每行輸入一個用戶名，包含 @ 符號',
  },
  keywords: {
    type: 'textarea',
    label: '關鍵字',
    placeholder: '每行一個關鍵字',
    required: true,
    hint: '每行輸入一個關鍵字',
  },
  country: {
    type: 'select',
    label: '國家 / 地區',
    placeholder: '選擇國家或地區',
    required: false,
    options: [
      { value: 'TW', label: '台灣' },
      { value: 'US', label: '美國' },
      { value: 'JP', label: '日本' },
      { value: 'KR', label: '韓國' },
      { value: 'HK', label: '香港' },
      { value: 'SG', label: '新加坡' },
      { value: 'MY', label: '馬來西亞' },
      { value: 'TH', label: '泰國' },
      { value: 'VN', label: '越南' },
      { value: 'PH', label: '菲律賓' },
      { value: 'ID', label: '印尼' },
      { value: 'IN', label: '印度' },
      { value: 'GB', label: '英國' },
      { value: 'DE', label: '德國' },
      { value: 'FR', label: '法國' },
      { value: 'BR', label: '巴西' },
      { value: 'AU', label: '澳洲' },
      { value: 'CA', label: '加拿大' },
    ],
  },
};

// Service-type specific link labels
export const SERVICE_TYPE_LINK_LABELS: Record<string, string> = {
  'Followers': '帳號 / 頁面連結',
  'Likes': '貼文 / 影片連結',
  'Views': '影片連結',
  'Comments': '貼文連結',
  'Shares': '貼文連結',
  'Live Viewers': '直播連結',
  'Reviews': '商家連結',
  'Traffic': '網站 URL',
  'Votes': '投票連結',
  'Saves': '貼文連結',
  'Mentions': '貼文連結',
  'Stories': '帳號連結',
  'Accounts': '',
  'Packages': '帳號連結',
  'Posts': '帳號 / 版面連結',
  'Other': '連結',
};

// ==================== Hot Deals (Featured Packages) ====================

export interface HotDeal {
  platform: string;
  serviceType: string;
  quality: string;
  quantity: number;
  label: string;
  tag?: string;
}

export const HOT_DEALS: HotDeal[] = [
  { platform: 'Instagram', serviceType: 'Followers', quality: 'Standard', quantity: 1000, label: 'IG 粉絲 1,000 人', tag: '最暢銷' },
  { platform: 'Instagram', serviceType: 'Likes', quality: 'Standard', quantity: 1000, label: 'IG 按讚 1,000 個', tag: '超划算' },
  { platform: 'YouTube', serviceType: 'Views', quality: 'Standard', quantity: 5000, label: 'YT 觀看 5,000 次' },
  { platform: 'Facebook', serviceType: 'Followers', quality: 'Standard', quantity: 1000, label: 'FB 粉絲 1,000 人' },
  { platform: 'TikTok', serviceType: 'Followers', quality: 'Standard', quantity: 1000, label: 'TikTok 粉絲 1,000 人' },
  { platform: 'Google', serviceType: 'Reviews', quality: 'HQ', quantity: 10, label: 'Google 五星評論 10 則', tag: '店家必備' },
];
