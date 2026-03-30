'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAnonymousId, getUTMParams, getLandingContent, getRefCode } from '@/lib/tracking';

const platforms = [
  { name: 'Instagram', slug: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-500', services: '粉絲、愛心、觀看、留言' },
  { name: 'Facebook', slug: 'Facebook', icon: '👍', color: 'from-blue-500 to-blue-600', services: '粉專追蹤、貼文讚、影片觀看' },
  { name: 'YouTube', slug: 'YouTube', icon: '▶️', color: 'from-red-500 to-red-600', services: '訂閱、觀看、按讚' },
  { name: 'TikTok', slug: 'TikTok', icon: '🎵', color: 'from-gray-900 to-gray-800', services: '粉絲、觀看、愛心' },
  { name: 'Google', slug: 'Google', icon: '⭐', color: 'from-green-500 to-blue-500', services: '商家評論、五星好評' },
  { name: 'Threads', slug: 'Threads', icon: '🧵', color: 'from-gray-700 to-gray-900', services: '粉絲、愛心' },
];

const stats = [
  { label: '服務用戶', value: '10,000+' },
  { label: '完成訂單', value: '50,000+' },
  { label: '支援平台', value: '30+' },
  { label: '自動派單', value: '3 分鐘' },
];

const steps = [
  { step: '1', title: '選擇服務', desc: '選擇平台和服務類型，挑選適合的品質方案' },
  { step: '2', title: '填寫資料', desc: '輸入社群帳號和 Email，免註冊即可下單' },
  { step: '3', title: '完成付款', desc: '支援新台幣付款，付款後 3 分鐘自動派單' },
];

const faqs = [
  { q: '需要註冊帳號嗎？', a: '不需要！只要填寫你的社群帳號和 Email 就能直接下單，全程免註冊。' },
  { q: '付款方式有哪些？', a: '支援信用卡、ATM 轉帳等新台幣付款方式，透過台灣主流金流平台安全交易。' },
  { q: '下單後多久開始？', a: '付款成功後系統會在 3 分鐘內自動派單，大部分服務會在 1-24 小時內開始執行。' },
  { q: '會不會被鎖帳號？', a: '我們提供多種品質方案，高品質方案使用真人帳號互動，安全性極高。建議選擇「標準方案」以上的服務。' },
  { q: '掉粉怎麼辦？', a: '高品質方案和真人精選方案都含有保固服務，在保固期內掉落會自動補充。' },
  { q: '可以開發票嗎？', a: '可以，付款完成後系統會自動開立電子發票至您的 Email。' },
];

export default function HomePage() {
  const [content, setContent] = useState(getLandingContent(null));
  const [promoCode, setPromoCode] = useState<string | undefined>();

  useEffect(() => {
    // Initialize tracking
    getAnonymousId();
    const utm = getUTMParams();
    getRefCode();

    // Set dynamic content based on UTM source
    const landingContent = getLandingContent(utm.utm_source || null);
    setContent(landingContent);
    setPromoCode(landingContent.promoCode);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {promoCode && (
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm">
                <span className="bg-accent-500 text-white px-2 py-0.5 rounded-full text-xs font-bold mr-2">優惠</span>
                {content.discount} — 優惠碼：<span className="font-bold ml-1">{promoCode}</span>
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              {content.headline || '全行銷 — 您的專業社群成長引擎與品牌曝光推手'}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              {content.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services/Instagram/" className="btn-accent text-lg !py-4 !px-8">
                {content.cta}
              </Link>
              <Link href="#platforms" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 border border-white/20">
                瀏覽所有服務
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section id="platforms" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">選擇您的社群行銷平台</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">我們支援所有主流社群平台，提供多種品質方案滿足不同需求，幫助您快速增加粉絲、提升品牌曝光度與社群互動率。</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((p) => (
              <Link key={p.slug} href={`/services/${p.slug}/`} className="card group hover:scale-[1.02]">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-2xl mb-4`}>
                  {p.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {p.name}
                </h3>
                <p className="text-gray-500 text-sm">{p.services}</p>
                <div className="mt-4 text-primary-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  查看方案 →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-900 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">簡單三步驟，快速增加社群影響力</h2>
            <p className="text-gray-400">免註冊、免下載，3 分鐘完成下單，台灣買粉絲讚自助下單平台首選</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">社群行銷服務常見問題</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="card group cursor-pointer">
                <summary className="font-semibold text-gray-900 list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">準備好提升你的社群影響力了嗎？</h2>
          <p className="text-white/80 mb-8 text-lg">免註冊、支援新台幣、3 分鐘自動派單</p>
          <Link href="/services/Instagram/" className="inline-block bg-white text-primary-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors text-lg">
            立即開始
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
