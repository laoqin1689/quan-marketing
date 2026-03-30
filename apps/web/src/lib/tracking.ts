'use client';

// Generate or retrieve anonymous ID
export function getAnonymousId(): string {
  if (typeof window === 'undefined') return '';

  let id = localStorage.getItem('qm_anon_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('qm_anon_id', id);
    // Also set as cookie for server-side access
    document.cookie = `qm_anon_id=${id}; path=/; max-age=${365 * 86400}; SameSite=Lax`;
  }
  return id;
}

// Parse UTM parameters from URL
export function getUTMParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};

  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ttclid', 'ref'];
  keys.forEach(key => {
    const val = params.get(key);
    if (val) utm[key] = val;
  });

  // Store in sessionStorage for persistence during session
  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem('qm_utm', JSON.stringify(utm));
  }

  // Return stored UTM if no new params
  const stored = sessionStorage.getItem('qm_utm');
  return stored ? JSON.parse(stored) : utm;
}

// Get ref code from URL or cookie
export function getRefCode(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');

  if (ref) {
    // Store in cookie for 30 days
    document.cookie = `qm_ref=${ref}; path=/; max-age=${30 * 86400}; SameSite=Lax`;
    return ref;
  }

  // Check cookie
  const match = document.cookie.match(/qm_ref=([^;]+)/);
  return match ? match[1] : null;
}

// Dynamic landing page content based on UTM source
export function getLandingContent(utmSource: string | null) {
  const contents: Record<string, { headline: string; subheadline: string; cta: string; promoCode?: string; discount?: string }> = {
    facebook: {
      headline: '讓你的 IG 粉絲數爆衝！',
      subheadline: '超過 10,000+ 台灣商家信賴的社群成長方案',
      cta: '立即搶購',
      promoCode: 'FB10',
      discount: '首單 85 折',
    },
    google: {
      headline: '安全穩定的社群成長方案',
      subheadline: '專業團隊為你打造最佳社群形象',
      cta: '查看方案',
    },
    tiktok: {
      headline: '跟上潮流，快速爆紅！',
      subheadline: '短影音時代，讓你的 TikTok 快速起飛',
      cta: '馬上擁有',
      promoCode: 'TIKTOK15',
      discount: '新用戶 85 折',
    },
    referral: {
      headline: '你的朋友推薦了這個好物',
      subheadline: '專屬推薦優惠，立即享受折扣',
      cta: '使用推薦碼',
      discount: '專屬 9 折',
    },
  };

  return contents[utmSource || ''] || {
    headline: '全行銷 — 你的社群成長引擎',
    subheadline: '一站式社群行銷服務，免註冊、3 分鐘自動派單',
    cta: '立即開始',
  };
}
