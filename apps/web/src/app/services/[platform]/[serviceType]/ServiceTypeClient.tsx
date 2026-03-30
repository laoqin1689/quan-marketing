'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAnonymousId, getUTMParams, getRefCode } from '@/lib/tracking';

// Static quality plans (in production, fetched from API)
const qualityPlans: Record<string, { id: number; quality: string; label: string; price: number; desc: string; features: string[] }[]> = {
  'Instagram-Followers': [
    { id: 1, quality: 'Economy', label: '經濟方案', price: 15, desc: '快速增加粉絲數', features: ['快速交付', '適合預算有限', '無保固'] },
    { id: 2, quality: 'Standard', label: '標準方案', price: 35, desc: '穩定的粉絲增長', features: ['混合帳號', '性價比最高', '穩定不掉'] },
    { id: 3, quality: 'HQ', label: '高品質方案', price: 65, desc: '真實帳號粉絲', features: ['有頭像和貼文', '30 天保固', '真實帳號'] },
    { id: 4, quality: 'Premium', label: '真人精選', price: 150, desc: '100% 真人活躍帳號', features: ['永久保固', '最高品質', '真人活躍'] },
    { id: 5, quality: 'Premium-TW', label: '台灣真人', price: 350, desc: '台灣本地真人帳號', features: ['台灣帳號', '永久保固', '在地品牌最佳'] },
  ],
  'Instagram-Likes': [
    { id: 6, quality: 'Economy', label: '經濟方案', price: 8, desc: '快速增加愛心', features: ['快速交付', '適合預算有限'] },
    { id: 7, quality: 'Standard', label: '標準方案', price: 18, desc: '穩定的愛心增長', features: ['不掉落', '性價比高'] },
    { id: 8, quality: 'HQ', label: '高品質方案', price: 35, desc: '真實帳號愛心', features: ['提升觸及率', '真實帳號'] },
    { id: 9, quality: 'Premium-TW', label: '台灣真人', price: 250, desc: '台灣真人按讚', features: ['台灣帳號', '最自然'] },
  ],
  'Instagram-Views': [
    { id: 10, quality: 'Standard', label: '標準方案', price: 5, desc: '增加觀看次數', features: ['快速交付', '高性價比'] },
    { id: 11, quality: 'HQ', label: '高品質方案', price: 12, desc: '高留存率觀看', features: ['提升演算法推薦', '高留存'] },
  ],
  'Instagram-Comments': [
    { id: 12, quality: 'Standard', label: '標準方案', price: 80, desc: '增加留言互動', features: ['英文留言', '快速交付'] },
    { id: 13, quality: 'HQ-TW', label: '台灣中文', price: 500, desc: '台灣帳號中文留言', features: ['中文留言', '看起來最自然'] },
  ],
};

// Fallback for platforms not fully defined
const defaultPlans = [
  { id: 100, quality: 'Standard', label: '標準方案', price: 30, desc: '穩定品質', features: ['穩定交付', '性價比高'] },
  { id: 101, quality: 'HQ', label: '高品質方案', price: 60, desc: '高品質服務', features: ['真實帳號', '含保固'] },
];

export default function ServiceTypeClient() {
  const params = useParams();
  const router = useRouter();
  const platform = decodeURIComponent(params.platform as string);
  const serviceType = decodeURIComponent(params.serviceType as string);

  const plans = qualityPlans[`${platform}-${serviceType}`] || defaultPlans;

  const [selectedPlan, setSelectedPlan] = useState(plans[1] || plans[0]);
  const [quantity, setQuantity] = useState(1000);
  const [socialAccount, setSocialAccount] = useState('');
  const [email, setEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pricePerUnit = selectedPlan.price / 1000;
  const totalPrice = Math.round(pricePerUnit * quantity);

  useEffect(() => {
    getAnonymousId();
    getUTMParams();
    getRefCode();
  }, []);

  const handleOrder = async () => {
    if (!socialAccount.trim()) {
      alert('請輸入你的社群帳號或連結');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      alert('請輸入有效的 Email');
      return;
    }

    setIsSubmitting(true);

    const utm = getUTMParams();
    const anonymousId = getAnonymousId();
    const refCode = getRefCode();

    // Store order data in sessionStorage and redirect to checkout
    const orderData = {
      social_account: socialAccount,
      social_platform: platform,
      email,
      items: [{ category_id: selectedPlan.id, quantity }],
      coupon_code: couponCode || undefined,
      ref_code: refCode || undefined,
      anonymous_id: anonymousId,
      ...utm,
    };

    sessionStorage.setItem('qm_order', JSON.stringify(orderData));
    sessionStorage.setItem('qm_order_display', JSON.stringify({
      platform,
      serviceType,
      plan: selectedPlan.label,
      quantity,
      totalPrice,
      socialAccount,
      email,
    }));

    router.push('/checkout/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600">首頁</Link>
            <span className="mx-2">/</span>
            <Link href={`/services/${platform}/`} className="hover:text-primary-600">{platform}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{serviceType}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Plans */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {platform} {serviceType} 方案
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`card text-left transition-all ${
                    selectedPlan.id === plan.id
                      ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50/50'
                      : 'hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{plan.label}</h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">NT${plan.price}</div>
                      <div className="text-xs text-gray-400">/ 每千</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{plan.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {plan.features.map((f) => (
                      <span key={f} className="badge-info text-xs">{f}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Quantity slider */}
            <div className="card mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                數量：<span className="text-primary-600 font-bold">{quantity.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min={100}
                max={50000}
                step={100}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>100</span>
                <span>50,000</span>
              </div>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(100, Math.min(50000, parseInt(e.target.value) || 100)))}
                className="input-field mt-3"
                placeholder="輸入自訂數量"
              />
            </div>
          </div>

          {/* Right: Order Form */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">下單資訊</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {platform} 帳號或連結 *
                  </label>
                  <input
                    type="text"
                    value={socialAccount}
                    onChange={(e) => setSocialAccount(e.target.value)}
                    placeholder={`輸入你的 ${platform} 帳號`}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-400 mt-1">用於接收訂單通知</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    優惠碼（選填）
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="輸入優惠碼"
                    className="input-field"
                  />
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{selectedPlan.label}</span>
                    <span>x {quantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>合計</span>
                    <span className="text-primary-600">NT${totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleOrder}
                  disabled={isSubmitting}
                  className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '處理中...' : '前往結帳'}
                </button>

                <div className="text-center text-xs text-gray-400 space-y-1">
                  <p>免註冊即可下單</p>
                  <p>支援新台幣付款</p>
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
