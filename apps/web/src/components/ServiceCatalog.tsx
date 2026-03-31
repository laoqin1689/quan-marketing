'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import PlatformIcon from './PlatformIcon';
import type { ServiceItem, FilterOption } from '@/lib/api';
import { parseRequiredFields, type CartItemExtraData } from '@/lib/cart';
import { FIELD_DEFINITIONS, SERVICE_TYPE_LINK_LABELS, LINK_PLACEHOLDERS } from '@/lib/constants';

// ==================== Constants ====================

const QUALITY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  'Bot/Low': { label: '超值版', color: 'text-gray-600', bg: 'bg-gray-100' },
  'Economy': { label: '經濟版', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  'Standard': { label: '標準版', color: 'text-blue-700', bg: 'bg-blue-50' },
  'HQ': { label: '高品質', color: 'text-purple-700', bg: 'bg-purple-50' },
  'Premium': { label: '精選真人', color: 'text-amber-700', bg: 'bg-amber-50' },
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
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

const QUALITY_ORDER = ['Bot/Low', 'Economy', 'Standard', 'HQ', 'Premium'];

// ==================== Types ====================

interface CartItem {
  service: ServiceItem;
  quantity: number;
  link: string;
  extraData?: CartItemExtraData;
}

interface ServiceCatalogProps {
  categories: ServiceItem[];
  filters: {
    platforms: FilterOption[];
    serviceTypes: FilterOption[];
    qualities: FilterOption[];
  };
}

// ==================== Helper ====================

function formatPrice(pricePer1k: number, quantity: number): string {
  const total = Math.round((pricePer1k / 1000) * quantity * 100) / 100;
  return `NT$${total.toLocaleString()}`;
}

function formatPricePer1k(price: number): string {
  if (price < 1) return `NT$${price.toFixed(2)}`;
  return `NT$${Math.round(price).toLocaleString()}`;
}

// ==================== Component ====================

export default function ServiceCatalog({ categories, filters }: ServiceCatalogProps) {
  // Filter states
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedQualities, setSelectedQualities] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopularOnly, setShowPopularOnly] = useState(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Card expand state (for mobile inline order)
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [cardQuantities, setCardQuantities] = useState<Record<number, number>>({});
  const [cardLinks, setCardLinks] = useState<Record<number, string>>({});
  // Dynamic field states per card
  const [cardComments, setCardComments] = useState<Record<number, string>>({});
  const [cardRatings, setCardRatings] = useState<Record<number, string>>({});
  const [cardAnswerNumbers, setCardAnswerNumbers] = useState<Record<number, string>>({});
  const [cardUsernames, setCardUsernames] = useState<Record<number, string>>({});

  // Sort platforms by count
  const sortedPlatforms = useMemo(() => {
    return [...filters.platforms].sort((a, b) => b.count - a.count);
  }, [filters.platforms]);

  // Sort qualities in order
  const sortedQualities = useMemo(() => {
    return [...filters.qualities].sort(
      (a, b) => QUALITY_ORDER.indexOf(a.name) - QUALITY_ORDER.indexOf(b.name)
    );
  }, [filters.qualities]);

  // Available service types based on selected platform
  const availableServiceTypes = useMemo(() => {
    let filtered = categories;
    if (selectedPlatform) {
      filtered = filtered.filter(c => c.platform === selectedPlatform);
    }
    const typeMap = new Map<string, number>();
    for (const c of filtered) {
      typeMap.set(c.service_type, (typeMap.get(c.service_type) || 0) + 1);
    }
    return Array.from(typeMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [categories, selectedPlatform]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    let result = categories;

    if (selectedPlatform) {
      result = result.filter(c => c.platform === selectedPlatform);
    }

    if (selectedTypes.size > 0) {
      result = result.filter(c => selectedTypes.has(c.service_type));
    }

    if (selectedQualities.size > 0) {
      result = result.filter(c => selectedQualities.has(c.quality));
    }

    if (showPopularOnly) {
      result = result.filter(c => c.is_popular);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.display_name.toLowerCase().includes(q) ||
        c.platform.toLowerCase().includes(q) ||
        c.service_type.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [categories, selectedPlatform, selectedTypes, selectedQualities, showPopularOnly, searchQuery]);

  // Toggle service type filter
  const toggleType = useCallback((type: string) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  // Toggle quality filter
  const toggleQuality = useCallback((quality: string) => {
    setSelectedQualities(prev => {
      const next = new Set(prev);
      if (next.has(quality)) next.delete(quality);
      else next.add(quality);
      return next;
    });
  }, []);

  // Add to cart with extra data
  const addToCart = useCallback((service: ServiceItem, quantity: number, link: string, extraData?: CartItemExtraData) => {
    const requiredFields = parseRequiredFields(service);
    if (requiredFields.includes('link') && !link.trim()) return;
    if (requiredFields.includes('quantity') && (quantity < service.min_quantity || quantity > service.max_quantity)) return;

    setCart(prev => {
      const existing = prev.findIndex(item => item.service.id === service.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { service, quantity, link, extraData };
        return updated;
      }
      return [...prev, { service, quantity, link, extraData }];
    });
    setExpandedCard(null);
    setShowCart(true);
  }, []);

  // Remove from cart
  const removeFromCart = useCallback((serviceId: number) => {
    setCart(prev => prev.filter(item => item.service.id !== serviceId));
  }, []);

  // Cart total
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      return sum + Math.round((item.service.base_price_twd / 1000) * item.quantity * 100) / 100;
    }, 0);
  }, [cart]);

  // Proceed to checkout
  const proceedToCheckout = useCallback(() => {
    if (cart.length === 0) return;

    const orderData = {
      social_account: cart[0].link,
      social_platform: cart[0].service.platform,
      email: '',
      items: cart.map(item => ({
        category_id: item.service.id,
        quantity: item.quantity,
        link: item.link,
        ...(item.extraData || {}),
      })),
    };

    const displayData = {
      items: cart.map(item => ({
        id: item.service.id,
        name: item.service.display_name,
        platform: item.service.platform,
        quantity: item.quantity,
        unit_price: item.service.base_price_twd / 1000,
        subtotal: Math.round((item.service.base_price_twd / 1000) * item.quantity * 100) / 100,
        link: item.link,
        extraData: item.extraData,
      })),
      total: cartTotal,
    };

    sessionStorage.setItem('qm_order', JSON.stringify(orderData));
    sessionStorage.setItem('qm_order_display', JSON.stringify(displayData));
    window.location.href = '/checkout/';
  }, [cart, cartTotal]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedPlatform(null);
    setSelectedTypes(new Set());
    setSelectedQualities(new Set());
    setSearchQuery('');
    setShowPopularOnly(false);
  }, []);

  const hasActiveFilters = selectedPlatform || selectedTypes.size > 0 || selectedQualities.size > 0 || showPopularOnly || searchQuery;

  // Build extra data for inline card form
  const buildCardExtraData = (service: ServiceItem): CartItemExtraData | undefined => {
    const data: CartItemExtraData = {};
    const rf = parseRequiredFields(service);
    if (rf.includes('comments') && cardComments[service.id]) data.comments = cardComments[service.id];
    if (rf.includes('rating') && cardRatings[service.id]) data.rating = parseInt(cardRatings[service.id]);
    if (rf.includes('answer_number') && cardAnswerNumbers[service.id]) data.answer_number = parseInt(cardAnswerNumbers[service.id]);
    if (rf.includes('usernames') && cardUsernames[service.id]) data.usernames = cardUsernames[service.id];
    return Object.keys(data).length > 0 ? data : undefined;
  };

  // Validate inline card form
  const validateCard = (service: ServiceItem): boolean => {
    const rf = parseRequiredFields(service);
    if (rf.includes('link') && !cardLinks[service.id]?.trim()) return false;
    if (rf.includes('comments') && !cardComments[service.id]?.trim()) return false;
    if (rf.includes('answer_number') && !cardAnswerNumbers[service.id]) return false;
    if (rf.includes('usernames') && !cardUsernames[service.id]?.trim()) return false;
    const qty = cardQuantities[service.id] || service.min_quantity;
    if (rf.includes('quantity') && (qty < service.min_quantity || qty > service.max_quantity)) return false;
    return true;
  };

  return (
    <div className="relative">
      {/* ==================== Search Bar ==================== */}
      <div className="mb-6">
        <div className="relative max-w-2xl mx-auto">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="搜尋服務... 例如：IG 粉絲、YouTube 觀看、Google 評論"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ==================== Platform Filter (horizontal scroll) ==================== */}
      <div className="mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedPlatform(null)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !selectedPlatform
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            全部平台
          </button>
          {sortedPlatforms.map(p => (
            <button
              key={p.name}
              onClick={() => setSelectedPlatform(selectedPlatform === p.name ? null : p.name)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedPlatform === p.name
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              <PlatformIcon platform={p.name} size="sm" />
              <span>{p.name}</span>
              <span className="text-[10px] opacity-60">({p.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ==================== Service Type Filter ==================== */}
      <div className="mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {availableServiceTypes.map(st => (
            <button
              key={st.name}
              onClick={() => toggleType(st.name)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTypes.has(st.name)
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-gray-300'
              }`}
            >
              {SERVICE_TYPE_LABELS[st.name] || st.name} ({st.count})
            </button>
          ))}
        </div>
      </div>

      {/* ==================== Quality Filter + Controls ==================== */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {sortedQualities.map(q => {
          const qi = QUALITY_LABELS[q.name] || { label: q.name, color: 'text-gray-600', bg: 'bg-gray-100' };
          return (
            <button
              key={q.name}
              onClick={() => toggleQuality(q.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedQualities.has(q.name)
                  ? `${qi.bg} ${qi.color} ring-1 ring-current`
                  : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-gray-300'
              }`}
            >
              {qi.label}
            </button>
          );
        })}
        <button
          onClick={() => setShowPopularOnly(!showPopularOnly)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            showPopularOnly
              ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-300'
              : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-gray-300'
          }`}
        >
          熱門推薦
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-600">
            清除篩選
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">{filteredCategories.length} 項服務</span>
      </div>

      {/* ==================== Service Cards Grid ==================== */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>找不到符合條件的服務</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map(service => {
            const qualityInfo = QUALITY_LABELS[service.quality] || { label: service.quality, color: 'text-gray-600', bg: 'bg-gray-100' };
            const isExpanded = expandedCard === service.id;
            const inCart = cart.some(item => item.service.id === service.id);
            const qty = cardQuantities[service.id] || service.min_quantity;
            const link = cardLinks[service.id] || '';
            const requiredFields = parseRequiredFields(service);
            const linkLabel = SERVICE_TYPE_LINK_LABELS[service.service_type] || '連結 / 帳號';
            const linkPlaceholder = LINK_PLACEHOLDERS[service.platform] || '貼上社群連結或帳號...';

            return (
              <div
                key={service.id}
                className={`bg-white rounded-2xl border transition-all ${
                  isExpanded ? 'border-primary-300 shadow-lg ring-1 ring-primary-100' :
                  inCart ? 'border-green-200 shadow-sm' : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                }`}
              >
                {/* Card Content */}
                <div className="p-4">
                  {/* Platform + Service Type */}
                  <div className="flex items-start gap-2.5 mb-2">
                    <PlatformIcon platform={service.platform} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${qualityInfo.bg} ${qualityInfo.color}`}>
                          {qualityInfo.label}
                        </span>
                        {service.region === 'TW' && (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-red-50 text-red-600">
                            台灣
                          </span>
                        )}
                        {service.region === 'Targeted' && (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 text-sky-600">
                            指定地區
                          </span>
                        )}
                        {service.is_popular === 1 && (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-600">
                            熱門
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                        {service.platform} {SERVICE_TYPE_LABELS[service.service_type] || service.service_type}
                      </h3>
                    </div>
                  </div>

                  {/* Price & Info */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-lg font-bold text-primary-600">
                      {formatPricePer1k(service.base_price_twd)}
                    </span>
                    <span className="text-xs text-gray-400">/ 1,000</span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {service.min_quantity.toLocaleString()} - {service.max_quantity.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {service.delivery_estimate}
                    </div>
                    {service.has_warranty === 1 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        含保固
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {service.description && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{service.description}</p>
                  )}

                  {/* Action Button */}
                  {!isExpanded ? (
                    <button
                      onClick={() => {
                        setExpandedCard(service.id);
                        if (!cardQuantities[service.id]) {
                          setCardQuantities(prev => ({ ...prev, [service.id]: service.min_quantity }));
                        }
                        // Set default rating for Reviews
                        if (requiredFields.includes('rating') && !cardRatings[service.id]) {
                          setCardRatings(prev => ({ ...prev, [service.id]: '5' }));
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        inCart
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                      }`}
                    >
                      {inCart ? '已加入購物車' : '立即訂購'}
                    </button>
                  ) : null}
                </div>

                {/* Expanded: Inline Order Form with Dynamic Fields */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 bg-gray-50/50">
                    <div className="space-y-3">
                      {/* Link input (if required) */}
                      {requiredFields.includes('link') && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {linkLabel} <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder={linkPlaceholder}
                            value={link}
                            onChange={(e) => setCardLinks(prev => ({ ...prev, [service.id]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 outline-none"
                          />
                        </div>
                      )}

                      {/* Quantity input (if required) */}
                      {requiredFields.includes('quantity') && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            數量 ({service.min_quantity.toLocaleString()} - {service.max_quantity.toLocaleString()})
                          </label>
                          <input
                            type="number"
                            min={service.min_quantity}
                            max={service.max_quantity}
                            value={qty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || service.min_quantity;
                              setCardQuantities(prev => ({ ...prev, [service.id]: val }));
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 outline-none"
                          />
                        </div>
                      )}

                      {/* Comments textarea (for Comments/Reviews/Posts) */}
                      {requiredFields.includes('comments') && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {FIELD_DEFINITIONS.comments.label} <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            placeholder={FIELD_DEFINITIONS.comments.placeholder}
                            value={cardComments[service.id] || ''}
                            onChange={(e) => setCardComments(prev => ({ ...prev, [service.id]: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 outline-none resize-none"
                          />
                          <p className="text-[10px] text-gray-400 mt-0.5">{FIELD_DEFINITIONS.comments.hint}</p>
                        </div>
                      )}

                      {/* Rating select (for Reviews) */}
                      {requiredFields.includes('rating') && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {FIELD_DEFINITIONS.rating.label}
                          </label>
                          <select
                            value={cardRatings[service.id] || '5'}
                            onChange={(e) => setCardRatings(prev => ({ ...prev, [service.id]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 outline-none bg-white"
                          >
                            {FIELD_DEFINITIONS.rating.options?.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Answer number select (for Votes) */}
                      {requiredFields.includes('answer_number') && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {FIELD_DEFINITIONS.answer_number.label} <span className="text-red-400">*</span>
                          </label>
                          <select
                            value={cardAnswerNumbers[service.id] || ''}
                            onChange={(e) => setCardAnswerNumbers(prev => ({ ...prev, [service.id]: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 outline-none bg-white"
                          >
                            <option value="">選擇投票選項</option>
                            {FIELD_DEFINITIONS.answer_number.options?.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Usernames textarea (for Mentions) */}
                      {requiredFields.includes('usernames') && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {FIELD_DEFINITIONS.usernames.label} <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            placeholder={FIELD_DEFINITIONS.usernames.placeholder}
                            value={cardUsernames[service.id] || ''}
                            onChange={(e) => setCardUsernames(prev => ({ ...prev, [service.id]: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 outline-none resize-none"
                          />
                          <p className="text-[10px] text-gray-400 mt-0.5">{FIELD_DEFINITIONS.usernames.hint}</p>
                        </div>
                      )}

                      {/* Price preview */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">預估金額</span>
                        <span className="font-bold text-primary-600 text-base">
                          {formatPrice(service.base_price_twd, qty)}
                        </span>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setExpandedCard(null)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => addToCart(service, qty, link, buildCardExtraData(service))}
                          disabled={!validateCard(service)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          加入購物車
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== Floating Cart Button ==================== */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(!showCart)}
          className="fixed bottom-6 right-6 z-40 bg-primary-600 text-white rounded-2xl px-5 py-3.5 shadow-xl hover:bg-primary-700 transition-all flex items-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <span className="font-semibold">{cart.length} 項</span>
          <span className="text-white/80">|</span>
          <span className="font-bold">NT${Math.round(cartTotal).toLocaleString()}</span>
        </button>
      )}

      {/* ==================== Cart Drawer ==================== */}
      {showCart && cart.length > 0 && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowCart(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
            {/* Cart Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">購物車 ({cart.length})</h3>
              <button onClick={() => setShowCart(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {cart.map(item => (
                <div key={item.service.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <PlatformIcon platform={item.service.platform} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.service.display_name}</p>
                      {item.link && <p className="text-xs text-gray-500 truncate mt-0.5">{item.link}</p>}
                      {item.extraData?.comments && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          留言: {item.extraData.comments.split('\n')[0]}...
                        </p>
                      )}
                      {item.extraData?.rating && (
                        <p className="text-xs text-amber-500 mt-0.5">
                          {'★'.repeat(item.extraData.rating)}{'☆'.repeat(5 - item.extraData.rating)}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {item.quantity.toLocaleString()} 個 x {formatPricePer1k(item.service.base_price_twd)}/1K
                        </span>
                        <span className="text-sm font-bold text-primary-600">
                          {formatPrice(item.service.base_price_twd, item.quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.service.id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="border-t border-gray-100 px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">總計</span>
                <span className="text-xl font-bold text-primary-600">
                  NT${Math.round(cartTotal).toLocaleString()}
                </span>
              </div>
              <button
                onClick={proceedToCheckout}
                className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold text-base hover:bg-primary-700 transition-all shadow-lg"
              >
                前往結帳
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
