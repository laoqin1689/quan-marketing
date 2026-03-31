'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PlatformIcon from '@/components/PlatformIcon';
import OrderModal from '@/components/OrderModal';
import MobileCheckoutBar from '@/components/MobileCheckoutBar';
import {
  QUALITY_LABELS, QUALITY_ORDER, SERVICE_TYPE_LABELS, PLATFORM_DISPLAY_NAMES, PRESET_QUANTITIES,
} from '@/lib/constants';
import { calcTotal, formatPrice, formatPricePer1k } from '@/lib/cart';
import type { ServiceItem } from '@/lib/api';

// ==================== SEO Content (kept for structured data) ====================

const platformSEOContent: Record<string, {
  h1: string;
  description: string;
  faqs: { q: string; a: string }[];
}> = {
  Instagram: {
    h1: 'Instagram 粉絲購買與互動提升服務',
    description: '全方位提升 IG 影響力，從粉絲到互動全面成長。全行銷提供專業的 Instagram 粉絲購買與互動提升服務。',
    faqs: [
      { q: '買 IG 粉絲會被鎖帳號嗎？', a: '我們提供多種品質方案，高品質方案使用真人帳號互動，安全性極高。建議選擇標準方案以上的服務，確保帳號安全。' },
      { q: 'IG 買粉絲多少錢？', a: '價格依粉絲品質和數量不同，全行銷提供從經濟方案到台灣真人粉絲的多種選擇，可依需求彈性選擇。' },
      { q: '買 IG 粉絲會掉嗎？', a: '高品質方案含有 30 天保固，真人精選和台灣真人方案提供永久保固，在保固期內掉落會自動補充。' },
    ],
  },
  Facebook: {
    h1: 'Facebook 粉絲購買與粉專追蹤服務',
    description: '快速增加 FB 粉專追蹤與人氣，提升品牌曝光度。全行銷提供專業的 Facebook 粉絲購買服務。',
    faqs: [
      { q: '購買 Facebook 粉絲安全嗎？', a: '我們提供多種品質方案，高品質方案使用真人帳號互動，安全性極高。' },
      { q: 'FB 買粉絲多少錢？', a: '價格依粉絲來源與數量不同，全行銷提供多種方案，從經濟方案到台灣真人粉絲都有。' },
      { q: '買 FB 粉絲會掉嗎？', a: '高品質方案和真人精選方案都含有保固服務，在保固期內掉落會自動補充。' },
    ],
  },
  YouTube: {
    h1: 'YouTube 訂閱購買與頻道成長服務',
    description: '快速增加 YT 訂閱與觀看，加速頻道成長。全行銷提供專業的 YouTube 訂閱購買與觀看次數增加服務。',
    faqs: [
      { q: 'YT 買訂閱安全嗎？', a: '我們的高品質方案使用真實帳號訂閱，不會影響您的頻道安全。' },
      { q: '買 YouTube 訂閱可以達到營利門檻嗎？', a: '可以，我們的訂閱服務能幫助您快速達到 1,000 訂閱者的門檻。' },
      { q: '買 YT 訂閱會掉嗎？', a: '高品質方案含有保固服務，真人精選方案提供永久保固。' },
    ],
  },
  TikTok: {
    h1: 'TikTok 粉絲購買與短影音人氣提升服務',
    description: '讓你的 TikTok 短影音快速爆紅，打造高人氣帳號。',
    faqs: [
      { q: '買 TikTok 粉絲安全嗎？', a: '我們的服務不需要提供帳號密碼，使用安全的方式增加粉絲。' },
      { q: 'TikTok 買觀看可以上推薦嗎？', a: '增加觀看次數能提升影片的互動數據，有助於提升演算法推薦機會。' },
    ],
  },
  Google: {
    h1: 'Google 商家評論與五星評價增加服務',
    description: '提升 Google 地圖星級評分，建立品牌信任度。',
    faqs: [
      { q: '餐廳 Google 評論怎麼增加？', a: '使用全行銷的 Google 商家評論服務，快速增加五星好評數量，提升整體星級評分。' },
      { q: '買 Google 真人五星評價安全嗎？', a: '我們的評論由真實帳號撰寫，內容自然且符合 Google 的評論規範。' },
    ],
  },
  Threads: {
    h1: 'Threads 粉絲購買與追蹤增加服務',
    description: '搶先佈局 Threads 平台，快速累積粉絲與影響力。',
    faqs: [
      { q: 'Threads 粉絲購買安全嗎？', a: '我們的服務不需要提供帳號密碼，只需提供 Threads 主頁網址即可。' },
      { q: '買 Threads 粉絲會影響 Instagram 帳號嗎？', a: '不會，Threads 和 Instagram 的粉絲系統是獨立的。' },
    ],
  },
  LINE: {
    h1: 'LINE 官方帳號好友增加服務',
    description: '快速累積 LINE OA 好友數，提升品牌曝光與行銷效益。',
    faqs: [
      { q: 'LINE 官方帳號如何有效增加好友數？', a: '使用全行銷的 LINE 好友增加服務，快速累積好友數，搭配優質內容經營。' },
      { q: '買 LINE 好友安全嗎？', a: '全行銷提供的 LINE 好友增加服務使用安全的方式進行，不需要提供帳號密碼。' },
    ],
  },
};

// ==================== Component ====================

export default function PlatformClient() {
  const params = useParams();
  const platform = decodeURIComponent(params.platform as string);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);

  const [customQty, setCustomQty] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Modal state
  const [modalService, setModalService] = useState<ServiceItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState(0);
  const [cartRefreshKey, setCartRefreshKey] = useState(0);

  // Fetch services for this platform
  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://quan-marketing-api.laoqin1689.workers.dev';
    fetch(`${API_BASE}/api/categories/all`)
      .then(res => res.json())
      .then(data => {
        const all: ServiceItem[] = data.categories || [];
        const platformServices = all.filter(s => s.platform === platform);
        setServices(platformServices);

        // Auto-select first service type
        if (platformServices.length > 0) {
          const types = getServiceTypes(platformServices);
          if (types.length > 0) setSelectedType(types[0].name);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [platform]);

  function getServiceTypes(svcs: ServiceItem[]) {
    const typeMap = new Map<string, number>();
    for (const s of svcs) {
      typeMap.set(s.service_type, (typeMap.get(s.service_type) || 0) + 1);
    }
    return Array.from(typeMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  const serviceTypes = useMemo(() => getServiceTypes(services), [services]);

  // Available qualities for selected type
  const availableQualities = useMemo(() => {
    if (!selectedType) return [];
    const filtered = services.filter(s => s.service_type === selectedType);
    const qSet = new Set(filtered.map(s => s.quality));
    return QUALITY_ORDER.filter(q => qSet.has(q));
  }, [services, selectedType]);

  // Auto-select quality when type changes
  useEffect(() => {
    if (availableQualities.length > 0) {
      if (availableQualities.includes('Standard')) {
        setSelectedQuality('Standard');
      } else {
        setSelectedQuality(availableQualities[0]);
      }
    } else {
      setSelectedQuality(null);
    }
    setShowCustom(false);
    setCustomQty('');
  }, [availableQualities, selectedType]);

  // Current service (matching type + quality, prefer Global region)
  const currentService = useMemo(() => {
    if (!selectedType || !selectedQuality) return null;
    const matches = services.filter(
      s => s.service_type === selectedType && s.quality === selectedQuality
    );
    return matches.find(s => s.region === 'Global') || matches[0] || null;
  }, [services, selectedType, selectedQuality]);

  // Regional variants
  const regionalVariants = useMemo(() => {
    if (!selectedType || !selectedQuality) return [];
    return services.filter(
      s => s.service_type === selectedType && s.quality === selectedQuality && s.region !== 'Global'
    );
  }, [services, selectedType, selectedQuality]);

  // Generate preset packages
  const presetPackages = useMemo(() => {
    if (!currentService) return [];
    const min = currentService.min_quantity;
    const max = currentService.max_quantity;

    let quantities = PRESET_QUANTITIES.filter(q => q >= min && q <= max);

    if (quantities.length === 0) {
      quantities = [min];
      let q = min;
      const multipliers = [2, 5, 10, 25, 50, 100];
      for (const m of multipliers) {
        const next = min * m;
        if (next <= max && quantities.length < 6) {
          quantities.push(next);
        }
      }
      if (!quantities.includes(max) && quantities.length < 7) {
        quantities.push(max);
      }
    }

    quantities = Array.from(new Set(quantities)).sort((a, b) => a - b).slice(0, 7);

    return quantities.map((qty, i) => {
      const total = calcTotal(currentService.base_price_twd, qty);
      let tag = '';
      if (quantities.length >= 3 && i === Math.floor(quantities.length / 2)) tag = '最暢銷';
      if (quantities.length >= 4 && i === quantities.length - 1) tag = '最划算';

      return { quantity: qty, total, tag };
    });
  }, [currentService]);

  const handlePackageClick = (qty: number) => {
    if (!currentService) return;
    setModalService(currentService);
    setModalQuantity(qty);
  };

  const handleCustomOrder = () => {
    if (!currentService) return;
    const qty = parseInt(customQty);
    if (!qty || qty < currentService.min_quantity || qty > currentService.max_quantity) return;
    setModalService(currentService);
    setModalQuantity(qty);
  };

  const displayName = PLATFORM_DISPLAY_NAMES[platform] || platform;
  const seoContent = platformSEOContent[platform];

  // JSON-LD
  const jsonLd = seoContent ? {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: seoContent.h1,
    description: seoContent.description,
    provider: { '@type': 'Organization', name: '全行銷', url: 'https://kravdo.lol' },
    areaServed: { '@type': 'Country', name: 'Taiwan' },
    serviceType: '社群行銷服務',
  } : null;

  const faqJsonLd = seoContent?.faqs ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seoContent.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600 transition-colors">首頁</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{displayName} 服務</span>
          </nav>
        </div>
      </div>

      {/* Platform Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <PlatformIcon platform={platform} size="xl" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{displayName} 服務</h1>
              <p className="text-sm text-gray-500 mt-1">
                共 {services.length} 項服務可選 — 選擇服務類型和品質方案，挑選適合你的套餐
              </p>
            </div>
          </div>
        </div>
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
      ) : services.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">找不到此平台的服務</p>
          <Link href="/" className="text-primary-600 font-medium hover:underline">返回首頁</Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* ==================== Service Type Tabs ==================== */}
          <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {serviceTypes.map(t => (
                <button
                  key={t.name}
                  onClick={() => setSelectedType(t.name)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    selectedType === t.name
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                  }`}
                >
                  {SERVICE_TYPE_LABELS[t.name] || t.name}
                  <span className="ml-1.5 text-xs opacity-70">{t.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ==================== Quality Switcher ==================== */}
          {availableQualities.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">選擇品質方案</span>
                <span className="text-xs text-gray-400">（不確定？選「標準版」就對了）</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableQualities.map(q => {
                  const info = QUALITY_LABELS[q] || { label: q, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', shortDesc: '', icon: '' };
                  const isSelected = selectedQuality === q;
                  const isRecommended = q === 'Standard';
                  return (
                    <button
                      key={q}
                      onClick={() => setSelectedQuality(q)}
                      className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? `${info.bg} ${info.border} shadow-md`
                          : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      {isRecommended && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-600 text-white">
                          推薦
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{info.icon}</span>
                        <span className={`font-semibold text-sm ${isSelected ? info.color : 'text-gray-800'}`}>
                          {info.label}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isSelected ? 'text-gray-700' : 'text-gray-400'}`}>
                        {info.shortDesc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== Current Service Info ==================== */}
          {currentService && (
            <div className="mb-6 flex items-center gap-4 flex-wrap text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                預計交付：{currentService.delivery_estimate || '1-24 小時'}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                每千單位 {formatPricePer1k(currentService.base_price_twd)}
              </span>
              {currentService.has_warranty === 1 && (
                <span className="flex items-center gap-1.5 text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  含保固服務
                </span>
              )}
            </div>
          )}

          {/* ==================== Preset Package Grid ==================== */}
          {presetPackages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
              {presetPackages.map((pkg) => (
                <button
                  key={pkg.quantity}
                  onClick={() => handlePackageClick(pkg.quantity)}
                  className="group relative bg-white rounded-2xl border border-gray-100 p-4 md:p-5 text-left hover:border-primary-300 hover:shadow-lg transition-all duration-200"
                >
                  {pkg.tag && (
                    <span className={`absolute -top-2 left-4 px-2.5 py-0.5 text-[10px] font-bold rounded-full text-white ${
                      pkg.tag === '最暢銷' ? 'bg-rose-500' : 'bg-green-500'
                    }`}>
                      {pkg.tag}
                    </span>
                  )}
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {pkg.quantity >= 10000 ? `${(pkg.quantity / 1000).toFixed(0)}K` : pkg.quantity.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    {SERVICE_TYPE_LABELS[selectedType || ''] || selectedType}
                  </p>
                  <p className="text-lg font-bold text-primary-600 group-hover:text-primary-700">
                    {formatPrice(pkg.total)}
                  </p>
                </button>
              ))}

              {/* Custom Quantity Card */}
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-4 md:p-5 flex flex-col justify-center">
                {!showCustom ? (
                  <button
                    onClick={() => setShowCustom(true)}
                    className="text-center text-gray-500 hover:text-primary-600 transition-colors w-full"
                  >
                    <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-sm font-medium">自訂數量</p>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={customQty}
                      onChange={(e) => setCustomQty(e.target.value)}
                      placeholder={`${currentService?.min_quantity || 10} ~ ${currentService?.max_quantity?.toLocaleString() || '100,000'}`}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 outline-none"
                      min={currentService?.min_quantity}
                      max={currentService?.max_quantity}
                      autoFocus
                    />
                    {customQty && currentService && parseInt(customQty) >= currentService.min_quantity && (
                      <p className="text-sm font-bold text-primary-600 text-center">
                        {formatPrice(calcTotal(currentService.base_price_twd, parseInt(customQty) || 0))}
                      </p>
                    )}
                    <button
                      onClick={handleCustomOrder}
                      disabled={!customQty || !currentService || parseInt(customQty) < (currentService?.min_quantity || 0) || parseInt(customQty) > (currentService?.max_quantity || Infinity)}
                      className="w-full py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      選擇
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== Regional Variants ==================== */}
          {regionalVariants.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                地區專屬方案
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {regionalVariants.map(variant => {
                  const regionLabel = variant.region === 'TW' ? '🇹🇼 台灣' : variant.region === 'Targeted' ? '🎯 指定地區' : variant.region;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setModalService(variant);
                        setModalQuantity(variant.min_quantity);
                      }}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all text-left"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            variant.region === 'TW' ? 'bg-red-50 text-red-600' : 'bg-sky-50 text-sky-600'
                          }`}>
                            {regionLabel}
                          </span>
                          {variant.has_warranty === 1 && (
                            <span className="text-[10px] text-green-600 font-medium">含保固</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate max-w-[200px]">{variant.display_name}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-bold text-primary-600">{formatPricePer1k(variant.base_price_twd)}</p>
                        <p className="text-[10px] text-gray-400">/ 千</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== Other Service Types ==================== */}
          {serviceTypes.length > 1 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {displayName} 其他服務
              </h3>
              <div className="flex flex-wrap gap-2">
                {serviceTypes.filter(t => t.name !== selectedType).map(t => (
                  <button
                    key={t.name}
                    onClick={() => { setSelectedType(t.name); window.scrollTo({ top: 200, behavior: 'smooth' }); }}
                    className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-all"
                  >
                    {SERVICE_TYPE_LABELS[t.name] || t.name}
                    <span className="ml-1 text-xs text-gray-400">{t.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== FAQ Section ==================== */}
      {seoContent?.faqs && seoContent.faqs.length > 0 && (
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">{displayName} 常見問題</h2>
            <div className="space-y-3">
              {seoContent.faqs.map((faq, i) => (
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
      )}

      <Footer />

      {/* Order Modal */}
      {modalService && (
        <OrderModal
          service={modalService}
          quantity={modalQuantity}
          onClose={() => setModalService(null)}
          onCartUpdate={() => setCartRefreshKey(k => k + 1)}
        />
      )}

      <MobileCheckoutBar refreshKey={cartRefreshKey} />
    </div>
  );
}
