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
