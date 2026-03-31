'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ServiceItem } from '@/lib/api';
import { calcTotal, formatPrice, formatPricePer1k, addToCartStorage, parseRequiredFields, type CartItemExtraData } from '@/lib/cart';
import { SERVICE_TYPE_LABELS, QUALITY_LABELS, LINK_PLACEHOLDERS, FIELD_DEFINITIONS, SERVICE_TYPE_LINK_LABELS, SERVICE_TYPE_EXTRA_FIELDS } from '@/lib/constants';
import PlatformIcon from './PlatformIcon';

interface OrderModalProps {
  service: ServiceItem;
  quantity: number;
  onClose: () => void;
  onCartUpdate: () => void;
}

export default function OrderModal({ service, quantity: initialQuantity, onClose, onCartUpdate }: OrderModalProps) {
  // ==================== State ====================
  const [quantity, setQuantity] = useState(initialQuantity);
  const [link, setLink] = useState('');
  const [comments, setComments] = useState('');
  const [rating, setRating] = useState('5');
  const [answerNumber, setAnswerNumber] = useState('');
  const [usernames, setUsernames] = useState('');
  const [keywords, setKeywords] = useState('');
  const [country, setCountry] = useState('');
  // New fields
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerGender, setReviewerGender] = useState('any');
  const [duration, setDuration] = useState('60');
  const [watchTime, setWatchTime] = useState('medium');
  const [dripFeed, setDripFeed] = useState(false);
  const [dripFeedRuns, setDripFeedRuns] = useState('');
  const [dripFeedInterval, setDripFeedInterval] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [priceAnimating, setPriceAnimating] = useState(false);
  const prevTotalRef = useRef(0);

  const qualityInfo = QUALITY_LABELS[service.quality] || { label: service.quality, color: 'text-gray-600', bg: 'bg-gray-100' };
  const total = calcTotal(service.base_price_twd, quantity);
  const unitPrice = service.base_price_twd / 1000;
  const placeholder = LINK_PLACEHOLDERS[service.platform] || '請輸入您的社群帳號連結';
  const requiredFields = parseRequiredFields(service);
  const linkLabel = SERVICE_TYPE_LINK_LABELS[service.service_type] || '連結 / 帳號';

  // Extra fields based on service type
  const extraFields = SERVICE_TYPE_EXTRA_FIELDS[service.service_type] || [];

  // ==================== Price Animation ====================
  useEffect(() => {
    if (prevTotalRef.current !== 0 && prevTotalRef.current !== total) {
      setPriceAnimating(true);
      const timer = setTimeout(() => setPriceAnimating(false), 400);
      return () => clearTimeout(timer);
    }
    prevTotalRef.current = total;
  }, [total]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ==================== Quantity Handlers ====================
  const handleQuantityChange = useCallback((newQty: number) => {
    const clamped = Math.max(service.min_quantity, Math.min(service.max_quantity, newQty));
    setQuantity(clamped);
    setError('');
  }, [service.min_quantity, service.max_quantity]);

  const handleQuantityInput = useCallback((val: string) => {
    const num = parseInt(val);
    if (isNaN(num)) {
      setQuantity(service.min_quantity);
    } else {
      handleQuantityChange(num);
    }
  }, [handleQuantityChange, service.min_quantity]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleQuantityChange(parseInt(e.target.value));
  }, [handleQuantityChange]);

  // ==================== Validation ====================
  const validate = (): boolean => {
    if (requiredFields.includes('link') && !link.trim()) {
      setError(`請輸入${linkLabel}`);
      return false;
    }
    if (requiredFields.includes('comments') && !comments.trim()) {
      setError('請輸入留言/評論內容（每行一條）');
      return false;
    }
    if (requiredFields.includes('answer_number') && !answerNumber) {
      setError('請選擇投票選項');
      return false;
    }
    if (requiredFields.includes('usernames') && !usernames.trim()) {
      setError('請輸入用戶名列表（每行一個）');
      return false;
    }
    if (requiredFields.includes('keywords') && !keywords.trim()) {
      setError('請輸入關鍵字（每行一個）');
      return false;
    }
    if (quantity < service.min_quantity || quantity > service.max_quantity) {
      setError(`數量需在 ${service.min_quantity.toLocaleString()} ~ ${service.max_quantity.toLocaleString()} 之間`);
      return false;
    }
    return true;
  };

  // ==================== Build Extra Data ====================
  const buildExtraData = (): CartItemExtraData | undefined => {
    const data: CartItemExtraData = {};
    if (comments.trim()) data.comments = comments.trim();
    if (rating && requiredFields.includes('rating')) data.rating = parseInt(rating);
    if (answerNumber) data.answer_number = parseInt(answerNumber);
    if (usernames.trim()) data.usernames = usernames.trim();
    if (keywords.trim()) data.keywords = keywords.trim();
    if (country) data.country = country;
    // New fields
    if (reviewerName.trim()) data.reviewer_name = reviewerName.trim();
    if (reviewerGender && reviewerGender !== 'any') data.reviewer_gender = reviewerGender;
    if (extraFields.includes('duration') && duration) data.duration = parseInt(duration);
    if (extraFields.includes('watch_time') && watchTime) data.watch_time = watchTime;
    if (dripFeed) {
      data.drip_feed = true;
      if (dripFeedRuns) data.drip_feed_runs = parseInt(dripFeedRuns);
      if (dripFeedInterval) data.drip_feed_interval = parseInt(dripFeedInterval);
    }
    if (notes.trim()) data.notes = notes.trim();
    return Object.keys(data).length > 0 ? data : undefined;
  };

  // ==================== Actions ====================
  const handleAddToCart = () => {
    if (!validate()) return;
    addToCartStorage({
      service,
      quantity,
      link: link.trim(),
      extraData: buildExtraData(),
    });
    onCartUpdate();
    setAdded(true);
    setTimeout(() => onClose(), 800);
  };

  const handleDirectCheckout = () => {
    if (!validate()) return;
    addToCartStorage({
      service,
      quantity,
      link: link.trim(),
      extraData: buildExtraData(),
    });
    onCartUpdate();
    window.location.href = '/checkout/';
  };

  // ==================== Render Field ====================
  const renderField = (fieldName: string) => {
    if (fieldName === 'link' || fieldName === 'quantity') return null;

    const fieldDef = FIELD_DEFINITIONS[fieldName];
    if (!fieldDef) return null;

    const fieldKey = `field-${fieldName}`;

    // Checkbox type (for drip_feed toggle)
    if (fieldDef.type === 'checkbox') {
      const isChecked = fieldName === 'drip_feed' ? dripFeed : false;
      const toggle = fieldName === 'drip_feed' ? () => setDripFeed(!dripFeed) : () => {};

      return (
        <div key={fieldKey} className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={toggle}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                isChecked ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                isChecked ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {fieldDef.label}
            </span>
          </label>
          {fieldDef.hint && (
            <p className="text-xs text-gray-400 mt-1 ml-14">{fieldDef.hint}</p>
          )}
        </div>
      );
    }

    // Textarea type
    if (fieldDef.type === 'textarea') {
      const value = fieldName === 'comments' ? comments
        : fieldName === 'usernames' ? usernames
        : fieldName === 'keywords' ? keywords
        : fieldName === 'notes' ? notes : '';
      const setter = fieldName === 'comments' ? setComments
        : fieldName === 'usernames' ? setUsernames
        : fieldName === 'keywords' ? setKeywords
        : fieldName === 'notes' ? setNotes : () => {};

      return (
        <div key={fieldKey} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {fieldDef.label} {fieldDef.required && <span className="text-red-400">*</span>}
          </label>
          <textarea
            value={value}
            onChange={(e) => { setter(e.target.value); setError(''); }}
            placeholder={fieldDef.placeholder}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 resize-none"
          />
          {fieldDef.hint && (
            <p className="text-xs text-gray-400 mt-1">{fieldDef.hint}</p>
          )}
        </div>
      );
    }

    // Select type
    if (fieldDef.type === 'select' && fieldDef.options) {
      const value = fieldName === 'rating' ? rating
        : fieldName === 'answer_number' ? answerNumber
        : fieldName === 'country' ? country
        : fieldName === 'reviewer_gender' ? reviewerGender
        : fieldName === 'duration' ? duration
        : fieldName === 'watch_time' ? watchTime : '';
      const setter = fieldName === 'rating' ? setRating
        : fieldName === 'answer_number' ? setAnswerNumber
        : fieldName === 'country' ? setCountry
        : fieldName === 'reviewer_gender' ? setReviewerGender
        : fieldName === 'duration' ? setDuration
        : fieldName === 'watch_time' ? setWatchTime : () => {};

      return (
        <div key={fieldKey} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {fieldDef.label} {fieldDef.required && <span className="text-red-400">*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => { setter(e.target.value); setError(''); }}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 bg-white"
          >
            {!fieldDef.defaultValue && (
              <option value="">{fieldDef.placeholder}</option>
            )}
            {fieldDef.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {fieldDef.hint && (
            <p className="text-xs text-gray-400 mt-1">{fieldDef.hint}</p>
          )}
        </div>
      );
    }

    // Text type
    if (fieldDef.type === 'text') {
      const value = fieldName === 'reviewer_name' ? reviewerName : '';
      const setter = fieldName === 'reviewer_name' ? setReviewerName : () => {};

      return (
        <div key={fieldKey} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {fieldDef.label} {fieldDef.required && <span className="text-red-400">*</span>}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => { setter(e.target.value); setError(''); }}
            placeholder={fieldDef.placeholder}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
          {fieldDef.hint && (
            <p className="text-xs text-gray-400 mt-1">{fieldDef.hint}</p>
          )}
        </div>
      );
    }

    // Number type (for drip feed fields)
    if (fieldDef.type === 'number') {
      const value = fieldName === 'drip_feed_runs' ? dripFeedRuns
        : fieldName === 'drip_feed_interval' ? dripFeedInterval : '';
      const setter = fieldName === 'drip_feed_runs' ? setDripFeedRuns
        : fieldName === 'drip_feed_interval' ? setDripFeedInterval : () => {};

      return (
        <div key={fieldKey} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {fieldDef.label} {fieldDef.required && <span className="text-red-400">*</span>}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => { setter(e.target.value); setError(''); }}
            placeholder={fieldDef.placeholder}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            min={1}
          />
          {fieldDef.hint && (
            <p className="text-xs text-gray-400 mt-1">{fieldDef.hint}</p>
          )}
        </div>
      );
    }

    return null;
  };

  // ==================== Slider percentage for styling ====================
  const sliderPercent = ((quantity - service.min_quantity) / (service.max_quantity - service.min_quantity)) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">確認訂單</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {/* Service Info Header */}
          <div className="flex items-start gap-3 mb-5">
            <PlatformIcon platform={service.platform} size="lg" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {service.platform} {SERVICE_TYPE_LABELS[service.service_type] || service.service_type}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${qualityInfo.bg} ${qualityInfo.color}`}>
                  {qualityInfo.label}
                </span>
                <span className="text-xs text-gray-400">
                  每千個 {formatPricePer1k(service.base_price_twd)}
                </span>
              </div>
              {service.delivery_estimate && (
                <p className="text-xs text-gray-400 mt-0.5">預計交付：{service.delivery_estimate}</p>
              )}
            </div>
          </div>

          {/* ==================== Quantity Adjuster ==================== */}
          <div className="mb-5 bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              數量調整
            </label>

            {/* Quantity Input with +/- buttons */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => handleQuantityChange(quantity - Math.max(1, Math.floor(service.min_quantity / 2)))}
                disabled={quantity <= service.min_quantity}
                className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityInput(e.target.value)}
                className="flex-1 text-center text-lg font-bold px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white"
                min={service.min_quantity}
                max={service.max_quantity}
              />
              <button
                onClick={() => handleQuantityChange(quantity + Math.max(1, Math.floor(service.min_quantity / 2)))}
                disabled={quantity >= service.max_quantity}
                className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Slider */}
            <div className="relative mb-2">
              <input
                type="range"
                min={service.min_quantity}
                max={service.max_quantity}
                step={Math.max(1, Math.floor((service.max_quantity - service.min_quantity) / 100))}
                value={quantity}
                onChange={handleSliderChange}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #2563eb 0%, #2563eb ${sliderPercent}%, #e5e7eb ${sliderPercent}%, #e5e7eb 100%)`,
                }}
              />
            </div>

            {/* Min/Max labels */}
            <div className="flex justify-between text-[10px] text-gray-400 mb-3">
              <span>最少 {service.min_quantity.toLocaleString()}</span>
              <span>最多 {service.max_quantity.toLocaleString()}</span>
            </div>

            {/* ==================== Price Calculation Display ==================== */}
            <div className="bg-white rounded-lg border border-gray-100 p-3">
              {/* Formula: unit price × quantity = total */}
              <div className="flex items-center justify-center gap-1.5 text-sm text-gray-600 mb-2">
                <span className="font-medium">{formatPricePer1k(service.base_price_twd)}</span>
                <span className="text-gray-400">/千</span>
                <span className="text-gray-400 mx-1">×</span>
                <span className="font-medium">{quantity.toLocaleString()}</span>
                <span className="text-gray-400">個</span>
                <span className="text-gray-400 mx-1">=</span>
              </div>
              {/* Total price with animation */}
              <div className="text-center">
                <span
                  className={`text-2xl font-bold transition-all duration-300 ${
                    priceAnimating
                      ? 'text-green-600 scale-110'
                      : 'text-primary-600 scale-100'
                  }`}
                  style={{
                    display: 'inline-block',
                    transform: priceAnimating ? 'scale(1.08)' : 'scale(1)',
                    transition: 'transform 0.3s ease, color 0.3s ease',
                  }}
                >
                  {formatPrice(total)}
                </span>
              </div>
              {/* Unit price hint */}
              <p className="text-center text-[10px] text-gray-400 mt-1">
                每個約 NT${unitPrice < 0.01 ? unitPrice.toFixed(4) : unitPrice < 1 ? unitPrice.toFixed(2) : unitPrice.toFixed(1)}
              </p>
            </div>
          </div>

          {/* ==================== Dynamic Form Fields ==================== */}

          {/* Link Input (if required) */}
          {requiredFields.includes('link') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {linkLabel} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => { setLink(e.target.value); setError(''); }}
                placeholder={placeholder}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                  error && !link.trim() ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                }`}
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1">
                請確認帳號為公開狀態，以便服務正常交付
              </p>
            </div>
          )}

          {/* Required fields from service config (comments, rating, answer_number, usernames, keywords, country) */}
          {requiredFields
            .filter(f => f !== 'link' && f !== 'quantity')
            .map(fieldName => renderField(fieldName))
          }

          {/* Extra fields based on service type (reviewer_name, reviewer_gender, duration, watch_time, etc.) */}
          {extraFields.map(fieldName => {
            // Skip drip feed sub-fields if drip feed is not enabled
            if ((fieldName === 'drip_feed_runs' || fieldName === 'drip_feed_interval') && !dripFeed) {
              return null;
            }
            // Don't render if already rendered as a required field
            if (requiredFields.includes(fieldName)) return null;
            return renderField(fieldName);
          })}

          {/* Notes field (always shown) */}
          {renderField('notes')}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg mb-3">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Warranty Info */}
          {service.has_warranty === 1 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg mb-4">
              <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs text-green-700">此方案含保固服務，掉落會自動補充</span>
            </div>
          )}
        </div>

        {/* Actions (fixed at bottom) */}
        <div className="px-6 pb-6 pt-3 border-t border-gray-50 shrink-0">
          {added ? (
            <div className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold text-center flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              已加入購物車
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleDirectCheckout}
                className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all shadow-lg text-base flex items-center justify-center gap-2"
              >
                立即購買
                <span
                  className={`transition-all duration-300 ${priceAnimating ? 'text-green-200' : ''}`}
                >
                  {formatPrice(total)}
                </span>
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all text-sm"
              >
                加入購物車，繼續選購
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
