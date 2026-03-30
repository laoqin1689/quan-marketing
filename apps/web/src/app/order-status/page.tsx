'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function OrderLookupPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      router.push(`/order-status/${orderNumber.trim()}/`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-20">
        <div className="card text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">查詢訂單</h1>
          <p className="text-gray-500 mb-6">輸入訂單編號查看最新狀態</p>

          <form onSubmit={handleLookup} className="space-y-4">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="輸入訂單編號，例如 QM20260330ABCDEF"
              className="input-field text-center"
            />
            <button type="submit" className="btn-primary w-full">
              查詢
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
