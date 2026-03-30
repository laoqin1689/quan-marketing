'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
  const router = useRouter();
  const [orderDisplay, setOrderDisplay] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  useEffect(() => {
    const display = sessionStorage.getItem('qm_order_display');
    const data = sessionStorage.getItem('qm_order');

    if (!display || !data) {
      router.push('/');
      return;
    }

    setOrderDisplay(JSON.parse(display));
    setOrderData(JSON.parse(data));
  }, [router]);

  const handlePayment = async () => {
    if (!orderData) return;
    setIsProcessing(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || '建立訂單失敗');
        setIsProcessing(false);
        return;
      }

      const result = await res.json();

      // Store order number for status page
      sessionStorage.setItem('qm_last_order', result.order_number);

      // In production: redirect to payment gateway
      // For now: simulate payment and redirect to status page
      router.push(`/order-status/${result.order_number}/`);
    } catch (error) {
      alert('網路錯誤，請稍後再試');
      setIsProcessing(false);
    }
  };

  if (!orderDisplay) {
    return (
      <div className="min-h-screen">
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">確認訂單</h1>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-3 space-y-6">
            {/* Order Details */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">訂單明細</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">平台</span>
                  <span className="font-medium">{orderDisplay.platform}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">服務</span>
                  <span className="font-medium">{orderDisplay.serviceType} - {orderDisplay.plan}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">數量</span>
                  <span className="font-medium">{orderDisplay.quantity?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">社群帳號</span>
                  <span className="font-medium">{orderDisplay.socialAccount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{orderDisplay.email}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">合計</span>
                  <span className="font-bold text-primary-600 text-xl">NT${orderDisplay.totalPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">付款方式</h2>
              <div className="space-y-3">
                {[
                  { id: 'credit_card', label: '信用卡', desc: 'Visa / Mastercard / JCB' },
                  { id: 'atm', label: 'ATM 轉帳', desc: '虛擬帳號轉帳' },
                  { id: 'cvs', label: '超商代碼', desc: '7-11 / 全家 / 萊爾富' },
                ].map((method) => (
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
                      <div className="font-medium text-gray-900">{method.label}</div>
                      <div className="text-xs text-gray-400">{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-2">
            <div className="card sticky top-20">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary-600">NT${orderDisplay.totalPrice?.toLocaleString()}</div>
                <div className="text-sm text-gray-400">含稅總計</div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="btn-primary w-full text-center mb-3 disabled:opacity-50"
              >
                {isProcessing ? '處理中...' : '確認付款'}
              </button>

              <Link href={`/services/${orderDisplay.platform}/${orderDisplay.serviceType}/`} className="block text-center text-sm text-gray-500 hover:text-gray-700">
                返回修改
              </Link>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-400">
                <div className="flex items-center">
                  <span className="mr-2">🔒</span>
                  <span>SSL 加密安全交易</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">⚡</span>
                  <span>付款後 3 分鐘自動派單</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📧</span>
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
