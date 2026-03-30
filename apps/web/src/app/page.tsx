'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ServiceCatalog from '@/components/ServiceCatalog';
import { getAnonymousId, getUTMParams, getLandingContent, getRefCode } from '@/lib/tracking';
import type { ServiceItem, FilterOption } from '@/lib/api';

// ==================== Static Data for SSG ====================

// We embed all 662 services as static JSON at build time via generateStaticParams
// For now, we fetch from API on client side with fallback

const stats = [
  { label: '服務項目', value: '662+' },
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
    title: '瀏覽選擇',
    desc: '在下方目錄篩選平台和服務類型，找到你需要的方案',
  },
  {
    step: '2',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
      </svg>
    ),
    title: '填寫下單',
    desc: '輸入社群連結和數量，加入購物車後直接結帳',
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

export default function HomePage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [filterData, setFilterData] = useState<{
    platforms: FilterOption[];
    serviceTypes: FilterOption[];
    qualities: FilterOption[];
  }>({ platforms: [], serviceTypes: [], qualities: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string | undefined>();
  const [content, setContent] = useState(getLandingContent(null));

  useEffect(() => {
    // Initialize tracking
    getAnonymousId();
    const utm = getUTMParams();
    getRefCode();
    const landingContent = getLandingContent(utm.utm_source || null);
    setContent(landingContent);
    setPromoCode(landingContent.promoCode);

    // Fetch all services
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://quan-marketing-api.laoqin1689.workers.dev';
    fetch(`${API_BASE}/api/categories/all`)
      .then(res => res.json())
      .then(data => {
        setServices(data.categories || []);
        setFilterData(data.filters || { platforms: [], serviceTypes: [], qualities: [] });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load services:', err);
        setError('載入服務失敗，請重新整理頁面');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ==================== Hero Section ==================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto">
            {promoCode && (
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-5 text-sm">
                <span className="bg-accent-500 text-white px-2 py-0.5 rounded-full text-xs font-bold mr-2">優惠</span>
                {content.discount} — 優惠碼：<span className="font-bold ml-1">{promoCode}</span>
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">
              全行銷 — 社群成長一站搞定
            </h1>
            <p className="text-base md:text-lg text-white/80 mb-6 max-w-2xl mx-auto">
              32 個平台、662 項服務，從粉絲、按讚到觀看、留言，一頁瀏覽全部方案。
              <br className="hidden sm:block" />
              免註冊、支援新台幣、3 分鐘自動派單。
            </p>
            <a
              href="#services"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-all text-base shadow-lg"
            >
              瀏覽所有服務
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
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

      {/* ==================== Service Catalog (Main Section) ==================== */}
      <section id="services" className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">全部服務目錄</h2>
            <p className="text-gray-500 text-sm">選擇平台和服務類型，直接在卡片上填寫數量下單</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center gap-3 text-gray-500">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                載入服務中...
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                重新載入
              </button>
            </div>
          ) : (
            <ServiceCatalog categories={services} filters={filterData} />
          )}
        </div>
      </section>

      {/* ==================== FAQ ==================== */}
      <section id="faq" className="py-12 md:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">常見問題</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-gray-50 rounded-xl group">
                <summary className="font-medium text-gray-900 list-none flex justify-between items-center cursor-pointer px-5 py-4 hover:bg-gray-100 rounded-xl transition-colors">
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
            href="#services"
            className="inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors"
          >
            立即開始選購
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
