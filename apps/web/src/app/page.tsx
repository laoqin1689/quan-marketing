'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PlatformIcon from '@/components/PlatformIcon';
import OrderModal from '@/components/OrderModal';
import MobileCheckoutBar from '@/components/MobileCheckoutBar';
import { getAnonymousId, getUTMParams, getLandingContent, getRefCode } from '@/lib/tracking';
import { SERVICE_TYPE_LABELS, QUALITY_LABELS, HOT_DEALS, PLATFORM_DISPLAY_NAMES } from '@/lib/constants';
import { calcTotal, formatPrice } from '@/lib/cart';
import type { ServiceItem, FilterOption } from '@/lib/api';

// ==================== Static Data ====================

const stats = [
  { label: '服務項目', value: '722+' },
  { label: '支援平台', value: '32' },
  { label: '自動派單', value: '3 分鐘' },
  { label: '品質方案', value: '5 種' },
];

const steps = [
  {
    step: '1',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: '選擇平台',
    desc: '點選你要推廣的社群平台，進入專屬服務頁面',
  },
  {
    step: '2',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: '選套餐下單',
    desc: '挑選數量和品質方案，填入帳號連結就能下單',
  },
  {
    step: '3',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: '自動交付',
    desc: '付款後 3 分鐘自動派單，全程免註冊',
  },
];

const faqs = [
  { q: '需要註冊帳號嗎？', a: '不需要！只要填寫你的社群帳號和 Email 就能直接下單，全程免註冊。' },
  { q: '付款方式有哪些？', a: '支援信用卡、ATM 轉帳等新台幣付款方式，透過台灣主流金流平台安全交易。' },
  { q: '下單後多久開始？', a: '付款成功後系統會在 3 分鐘內自動派單，大部分服務會在 1-24 小時內開始執行。' },
  { q: '會不會被鎖帳號？', a: '我們提供多種品質方案，高品質方案使用真人帳號互動，安全性極高。建議選擇「標準版」以上的服務。' },
  { q: '掉粉怎麼辦？', a: '高品質方案和精選真人方案都含有保固服務，在保固期內掉落會自動補充。' },
  { q: '可以開發票嗎？', a: '可以，付款完成後系統會自動開立電子發票至您的 Email。' },
  { q: '經濟版和精選真人有什麼差別？', a: '經濟版價格最低，適合預算有限的用戶；精選真人使用 100% 真人活躍帳號，品質最高且含永久保固。建議根據需求選擇。' },
];

// ==================== Component ====================

export default function HomePage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [platforms, setPlatforms] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ServiceItem[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [promoCode, setPromoCode] = useState<string | undefined>();
  const [content, setContent] = useState(getLandingContent(null));
  const [cartRefreshKey, setCartRefreshKey] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    getAnonymousId();
    const utm = getUTMParams();
    getRefCode();
    const landingContent = getLandingContent(utm.utm_source || null);
    setContent(landingContent);
    setPromoCode(landingContent.promoCode);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://quan-marketing-api.laoqin1689.workers.dev';
    fetch(`${API_BASE}/api/categories/all`)
      .then(res => res.json())
      .then(data => {
        setServices(data.categories || []);
        const sortedPlatforms = [...(data.filters?.platforms || [])].sort((a: FilterOption, b: FilterOption) => b.count - a.count);
        setPlatforms(sortedPlatforms);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search handler with debounce
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (q.trim().length < 1) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      const lower = q.toLowerCase();
      const results = services.filter(s =>
        s.display_name.toLowerCase().includes(lower) ||
        s.platform.toLowerCase().includes(lower) ||
        s.service_type.toLowerCase().includes(lower) ||
        (s.description && s.description.toLowerCase().includes(lower))
      ).slice(0, 8);
      setSearchResults(results);
      setShowSearchDropdown(true);
    }, 200);
  }, [services]);

  // Hot deals with real service data
  const hotDeals = useMemo(() => {
    return HOT_DEALS.map(deal => {
      const match = services.find(s =>
        s.platform === deal.platform &&
        s.service_type === deal.serviceType &&
        s.quality === deal.quality &&
        s.region === 'Global'
      );
      if (!match) return null;
      const total = calcTotal(match.base_price_twd, deal.quantity);
      return { ...deal, service: match, total };
    }).filter(Boolean) as (typeof HOT_DEALS[0] & { service: ServiceItem; total: number })[];
  }, [services]);

  // Platforms to show
  const visiblePlatforms = showAllPlatforms ? platforms : platforms.slice(0, 12);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ==================== Hero Section ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            {promoCode && (
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5 text-sm">
                <span className="bg-accent-500 text-white px-2 py-0.5 rounded-full text-xs font-bold mr-2">優惠</span>
                {content.discount} — 優惠碼：<span className="font-bold ml-1">{promoCode}</span>
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">
              社群成長，一站搞定
            </h1>
            <p className="text-base md:text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              32 個平台、722 項服務。選平台、挑套餐、填連結，三步完成下單。
              <br className="hidden sm:block" />
              免註冊、支援新台幣、3 分鐘自動派單。
            </p>

            {/* Search Box */}
            <div ref={searchRef} className="relative max-w-xl mx-auto">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜尋服務... 例如：IG 粉絲、YouTube 觀看、Google 評論"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.trim() && searchResults.length > 0 && setShowSearchDropdown(true)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-white/50 outline-none text-sm shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchDropdown(false); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Search Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  {searchResults.map(s => {
                    const qi = QUALITY_LABELS[s.quality] || { label: s.quality, bg: 'bg-gray-100', color: 'text-gray-600' };
                    return (
                      <Link
                        key={s.id}
                        href={`/services/${encodeURIComponent(s.platform)}/`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        <PlatformIcon platform={s.platform} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{s.display_name}</p>
                          <p className="text-xs text-gray-400">
                            {SERVICE_TYPE_LABELS[s.service_type] || s.service_type}
                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${qi.bg} ${qi.color}`}>{qi.label}</span>
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary-600 shrink-0">
                          {formatPrice(s.base_price_twd)}/千
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {stats.map(stat => (
              <div key={stat.label} className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-3 px-4">
                <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-white/60 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== How It Works ==================== */}
      <section id="how-it-works" className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(s => (
              <div key={s.step} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white shrink-0">
                  {s.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== Platform Grid (Core Change) ==================== */}
      <section id="platforms" className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">選擇你的平台</h2>
            <p className="text-gray-500 text-sm">點擊平台圖標，查看所有可用服務和套餐方案</p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3 text-gray-500">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                載入中...
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
                {visiblePlatforms.map(p => (
                  <Link
                    key={p.name}
                    href={`/services/${encodeURIComponent(p.name)}/`}
                    className="group flex flex-col items-center gap-2 p-4 md:p-5 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-200"
                  >
                    <PlatformIcon platform={p.name} size="xl" className="group-hover:scale-110 transition-transform" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {PLATFORM_DISPLAY_NAMES[p.name] || p.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.count} 項服務</p>
                    </div>
                  </Link>
                ))}
              </div>

              {platforms.length > 12 && (
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {showAllPlatforms ? '收起' : `查看全部 ${platforms.length} 個平台`}
                    <svg className={`w-4 h-4 transition-transform ${showAllPlatforms ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ==================== Hot Deals (Quick Conversion) ==================== */}
      {hotDeals.length > 0 && (
        <section className="py-10 md:py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">熱門推薦套餐</h2>
              <p className="text-gray-500 text-sm">最多人購買的方案，點擊直接下單</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotDeals.map((deal, i) => (
                <Link
                  key={i}
                  href={`/services/${encodeURIComponent(deal.platform)}/`}
                  className="group relative flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg hover:bg-white transition-all duration-200"
                >
                  {deal.tag && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                      {deal.tag}
                    </span>
                  )}
                  <PlatformIcon platform={deal.platform} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{deal.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{deal.service.delivery_estimate}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-primary-600">{formatPrice(deal.total)}</p>
                    <p className="text-[10px] text-gray-400">起</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ==================== FAQ ==================== */}
      <section id="faq" className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">常見問題</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white rounded-xl group">
                <summary className="font-medium text-gray-900 list-none flex justify-between items-center cursor-pointer px-5 py-4 hover:bg-gray-50 rounded-xl transition-colors">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform ml-4 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">準備好提升你的社群影響力了嗎？</h2>
          <p className="text-white/80 mb-6">免註冊、支援新台幣、3 分鐘自動派單</p>
          <a
            href="#platforms"
            className="inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors"
          >
            立即開始選購
          </a>
        </div>
      </section>

      <Footer />
      <MobileCheckoutBar refreshKey={cartRefreshKey} />
    </div>
  );
}
