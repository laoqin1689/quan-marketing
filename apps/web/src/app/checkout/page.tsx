'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PlatformIcon from '@/components/PlatformIcon';
import { getCart, removeFromCartStorage, clearCartStorage, getCartTotal, formatPrice, calcTotal, type CartItem } from '@/lib/cart';
import { SERVICE_TYPE_LABELS, QUALITY_LABELS } from '@/lib/constants';
import { getAnonymousId, getUTMParams, getRefCode } from '@/lib/tracking';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [email, setEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const items = getCart();
    if (items.length === 0) {
      // Also check legacy sessionStorage
      const legacy = sessionStorage.getItem('qm_order');
      if (!legacy) {
        // Cart is empty, stay on page (show empty state)
      }
    }
    setCart(items);
    getAnonymousId();
    getUTMParams();
    getRefCode();
  }, []);

  const handleRemove = (serviceId: number) => {
    const updated = removeFromCartStorage(serviceId);
    setCart(updated);
  };

  const total = getCartTotal(cart);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setError('購物車是空的，請先選擇服務');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('請輸入有效的 Email');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const utm = getUTMParams();
    const anonymousId = getAnonymousId();
    const refCode = getRefCode();

    const orderData = {
      social_account: cart[0].link,
      social_platform: cart[0].service.platform,
      email,
      items: cart.map(item => ({
        category_id: item.service.id,
        quantity: item.quantity,
      })),
      coupon_code: couponCode || undefined,
      ref_code: refCode || undefined,
      anonymous_id: anonymousId,
      ...utm,
    };

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://quan-marketing-api.laoqin1689.workers.dev';
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '下單失敗，請稍後再試');
        setIsSubmitting(false);
        return;
      }

      setOrderResult(data);
      clearCartStorage();
    } catch (err) {
      setError('網路錯誤，請稍後再試');
    }
    setIsSubmitting(false);
  };

  // Order success view
  if (orderResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">訂單已建立</h1>
          <p className="text-gray-500 mb-6">
            訂單編號：<span className="font-mono font-bold text-primary-600">{orderResult.order_number}</span>
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 text-left">
            <div className="flex justify-between mb-3">
              <span className="text-gray-500">訂單金額</span>
              <span className="font-bold text-gray-900">{formatPrice(orderResult.total_amount)}</span>
            </div>
            {orderResult.discount_amount > 0 && (
              <div className="flex justify-between mb-3">
                <span className="text-gray-500">折扣</span>
                <span className="font-bold text-green-600">-{formatPrice(orderResult.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">狀態</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">等待付款</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            請依照付款指示完成付款，付款後系統會在 3 分鐘內自動派單。
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href={`/order-status/?order=${orderResult.order_number}`}
              className="px-6 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all shadow-lg"
            >
              查看訂單狀態
            </Link>
            <Link href="/" className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all">
              返回首頁
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600 transition-colors">首頁</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">結帳</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">確認訂單</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <p className="text-gray-500 mb-4">購物車是空的</p>
            <Link href="/" className="inline-block px-6 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all">
              瀏覽服務
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Order Details */}
            <div className="lg:col-span-3 space-y-6">
              {/* Cart Items */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-900">訂單項目 ({cart.length})</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {cart.map((item) => {
                    const qi = QUALITY_LABELS[item.service.quality] || { label: item.service.quality, bg: 'bg-gray-100', color: 'text-gray-600' };
                    const itemTotal = calcTotal(item.service.base_price_twd, item.quantity);
                    return (
                      <div key={item.service.id} className="flex items-center gap-4 px-6 py-4">
                        <PlatformIcon platform={item.service.platform} size="lg" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">
                            {item.service.platform} {SERVICE_TYPE_LABELS[item.service.service_type] || item.service.service_type}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${qi.bg} ${qi.color}`}>
                              {qi.label}
                            </span>
                            <span className="text-xs text-gray-400">{item.quantity.toLocaleString()} 個</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{item.link}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-primary-600">{formatPrice(itemTotal)}</p>
                          <button
                            onClick={() => handleRemove(item.service.id)}
                            className="text-xs text-red-400 hover:text-red-600 mt-1"
                          >
                            移除
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h2 className="font-bold text-gray-900">聯絡資訊</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">訂單通知和發票將發送至此信箱</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    優惠碼（選填）
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="輸入優惠碼"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-4">付款方式</h2>
                <div className="space-y-3">
                  {[
                    { id: 'credit_card', label: '信用卡', desc: 'Visa / Mastercard / JCB' },
                    { id: 'atm', label: 'ATM 轉帳', desc: '虛擬帳號轉帳' },
                    { id: 'cvs', label: '超商代碼', desc: '7-11 / 全家 / 萊爾富' },
                  ].map(method => (
                    <label
                      key={method.id}
                      className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50/50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3 accent-primary-600"
                      />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{method.label}</div>
                        <div className="text-xs text-gray-400">{method.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
                <h2 className="font-bold text-gray-900 mb-4">訂單摘要</h2>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">小計 ({cart.length} 項)</span>
                    <span className="font-medium">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mb-6">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">合計</span>
                    <span className="text-2xl font-bold text-primary-600">{formatPrice(total)}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !email.trim()}
                  className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      處理中...
                    </span>
                  ) : (
                    `確認付款 ${formatPrice(total)}`
                  )}
                </button>

                <Link href="/" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3">
                  返回繼續選購
                </Link>

                <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>SSL 加密安全交易</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>付款後 3 分鐘自動派單</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>訂單通知發送至 Email</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
