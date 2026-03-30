'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAnonymousId, getUTMParams, getRefCode } from '@/lib/tracking';

interface DisplayItem {
  id: number;
  name: string;
  platform: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  link: string;
}

interface DisplayData {
  items: DisplayItem[];
  total: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [displayData, setDisplayData] = useState<DisplayData | null>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  useEffect(() => {
    const display = sessionStorage.getItem('qm_order_display');
    const data = sessionStorage.getItem('qm_order');

    if (!display || !data) {
      router.push('/');
      return;
    }

    setDisplayData(JSON.parse(display));
    setOrderData(JSON.parse(data));
  }, [router]);

  const handlePayment = async () => {
    if (!orderData || !email.trim()) return;
    setIsProcessing(true);

    try {
      const anonymousId = getAnonymousId();
      const utm = getUTMParams();
      const refCode = getRefCode();

      const payload = {
        ...orderData,
        email,
        coupon_code: couponCode || undefined,
        anonymous_id: anonymousId,
        ref_code: refCode || undefined,
        ...utm,
      };

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://quan-marketing-api.laoqin1689.workers.dev';
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || '建立訂單失敗');
        setIsProcessing(false);
        return;
      }

      const result = await res.json();
      sessionStorage.setItem('qm_last_order', result.order_number);
      sessionStorage.removeItem('qm_order');
      sessionStorage.removeItem('qm_order_display');
      router.push(`/order-status/${result.order_number}/`);
    } catch (error) {
      alert('網路錯誤，請稍後再試');
      setIsProcessing(false);
    }
  };

  if (!displayData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-500">載入中...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/#services" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">確認訂單</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Order Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">訂單項目 ({displayData.items.length})</h2>
              <div className="space-y-4">
                {displayData.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.quantity.toLocaleString()} 個 &middot; {item.link}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary-600 shrink-0 ml-4">
                      NT${Math.round(item.subtotal).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">聯絡資訊</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">訂單通知和發票將發送至此信箱</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">優惠碼（選填）</label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="輸入優惠碼"
                    className="input-field"
                  />
                </div>
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
                  <span className="text-gray-500">小計 ({displayData.items.length} 項)</span>
                  <span className="font-medium">NT${Math.round(displayData.total).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-6">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">合計</span>
                  <span className="text-2xl font-bold text-primary-600">
                    NT${Math.round(displayData.total).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing || !email.trim()}
                className="w-full py-3.5 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-base"
              >
                {isProcessing ? '處理中...' : '確認付款'}
              </button>

              <Link href="/#services" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3">
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
      </div>

      <Footer />
    </div>
  );
}
