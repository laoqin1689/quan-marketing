'use client';

import { useState, useEffect } from 'react';
import type { ServiceItem } from '@/lib/api';
import { calcTotal, formatPrice, addToCartStorage, parseRequiredFields, type CartItemExtraData } from '@/lib/cart';
import { SERVICE_TYPE_LABELS, QUALITY_LABELS, LINK_PLACEHOLDERS, FIELD_DEFINITIONS, SERVICE_TYPE_LINK_LABELS } from '@/lib/constants';
import PlatformIcon from './PlatformIcon';

interface OrderModalProps {
  service: ServiceItem;
  quantity: number;
  onClose: () => void;
  onCartUpdate: () => void;
}

export default function OrderModal({ service, quantity, onClose, onCartUpdate }: OrderModalProps) {
  const [link, setLink] = useState('');
  const [comments, setComments] = useState('');
  const [rating, setRating] = useState('5');
  const [answerNumber, setAnswerNumber] = useState('');
  const [usernames, setUsernames] = useState('');
  const [keywords, setKeywords] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  const qualityInfo = QUALITY_LABELS[service.quality] || { label: service.quality, color: 'text-gray-600', bg: 'bg-gray-100' };
  const total = calcTotal(service.base_price_twd, quantity);
  const placeholder = LINK_PLACEHOLDERS[service.platform] || '請輸入您的社群帳號連結';
  const requiredFields = parseRequiredFields(service);
  const linkLabel = SERVICE_TYPE_LINK_LABELS[service.service_type] || '連結 / 帳號';

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
    return true;
  };

  const buildExtraData = (): CartItemExtraData | undefined => {
    const data: CartItemExtraData = {};
    if (comments.trim()) data.comments = comments.trim();
    if (rating && requiredFields.includes('rating')) data.rating = parseInt(rating);
    if (answerNumber) data.answer_number = parseInt(answerNumber);
    if (usernames.trim()) data.usernames = usernames.trim();
    if (keywords.trim()) data.keywords = keywords.trim();
    if (country) data.country = country;
    return Object.keys(data).length > 0 ? data : undefined;
  };

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

  // Render a dynamic field based on field name
  const renderField = (fieldName: string) => {
    // Skip link and quantity (handled separately)
    if (fieldName === 'link' || fieldName === 'quantity') return null;

    const fieldDef = FIELD_DEFINITIONS[fieldName];
    if (!fieldDef) return null;

    const fieldKey = `field-${fieldName}`;

    if (fieldDef.type === 'textarea') {
      const value = fieldName === 'comments' ? comments
        : fieldName === 'usernames' ? usernames
        : fieldName === 'keywords' ? keywords : '';
      const setter = fieldName === 'comments' ? setComments
        : fieldName === 'usernames' ? setUsernames
        : fieldName === 'keywords' ? setKeywords : () => {};

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

    if (fieldDef.type === 'select' && fieldDef.options) {
      const value = fieldName === 'rating' ? rating
        : fieldName === 'answer_number' ? answerNumber
        : fieldName === 'country' ? country : '';
      const setter = fieldName === 'rating' ? setRating
        : fieldName === 'answer_number' ? setAnswerNumber
        : fieldName === 'country' ? setCountry : () => {};

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

    return null;
  };

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
          {/* Order Summary */}
          <div className="flex items-start gap-3 mb-4">
            <PlatformIcon platform={service.platform} size="lg" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {service.platform} {SERVICE_TYPE_LABELS[service.service_type] || service.service_type}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${qualityInfo.bg} ${qualityInfo.color}`}>
                  {qualityInfo.label}
                </span>
                <span className="text-sm text-gray-500">{quantity.toLocaleString()} 個</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary-600">{formatPrice(total)}</p>
              {service.delivery_estimate && (
                <p className="text-xs text-gray-400 mt-0.5">{service.delivery_estimate}</p>
              )}
            </div>
          </div>

          {/* Dynamic Form Fields */}

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

          {/* Other dynamic fields (comments, rating, answer_number, usernames, keywords, country) */}
          {requiredFields
            .filter(f => f !== 'link' && f !== 'quantity')
            .map(fieldName => renderField(fieldName))
          }

          {/* Error message */}
          {error && <p className="text-xs text-red-500 mb-3 px-1">{error}</p>}

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
            <div className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold text-center">
              已加入購物車
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleDirectCheckout}
                className="w-full py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-all shadow-lg text-base"
              >
                立即購買 {formatPrice(total)}
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
    </div>
  );
}
