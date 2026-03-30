'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const statusMap: Record<string, { label: string; color: string; step: number }> = {
  pending: { label: '待處理', color: 'badge-warning', step: 1 },
  awaiting_payment: { label: '待付款', color: 'badge-warning', step: 1 },
  paid: { label: '已付款', color: 'badge-info', step: 2 },
  processing: { label: '處理中', color: 'badge-info', step: 3 },
  in_progress: { label: '執行中', color: 'badge-info', step: 3 },
  partial: { label: '部分完成', color: 'badge-warning', step: 3 },
  completed: { label: '已完成', color: 'badge-success', step: 4 },
  cancelled: { label: '已取消', color: 'badge-error', step: 0 },
  refunded: { label: '已退款', color: 'badge-error', step: 0 },
};

const steps = ['下單', '付款', '執行中', '完成'];

export default function OrderStatusPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderNumber || orderNumber === 'undefined') return;

    const fetchOrder = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${API_BASE}/api/orders/${orderNumber}`);
        if (!res.ok) {
          setError('訂單不存在');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setOrder(data);
      } catch {
        setError('無法載入訂單資訊');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    // Poll every 30 seconds
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [orderNumber]);

  const status = order ? statusMap[order.status] || statusMap.pending : statusMap.pending;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">訂單狀態</h1>
        <p className="text-gray-500 mb-8">訂單編號：{orderNumber}</p>

        {loading ? (
          <div className="card text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">載入中...</p>
          </div>
        ) : error ? (
          <div className="card text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-gray-400 text-sm">請確認訂單編號是否正確</p>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Progress Steps */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                {steps.map((step, i) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i + 1 <= status.step
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {i + 1 <= status.step ? '✓' : i + 1}
                    </div>
                    <span className={`ml-2 text-sm ${i + 1 <= status.step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                      {step}
                    </span>
                    {i < steps.length - 1 && (
                      <div className={`w-12 md:w-24 h-0.5 mx-2 ${
                        i + 1 < status.step ? 'bg-primary-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center">
                <span className={status.color}>{status.label}</span>
              </div>
            </div>

            {/* Order Details */}
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">訂單明細</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">平台</span>
                  <span className="font-medium">{order.social_platform}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">社群帳號</span>
                  <span className="font-medium">{order.social_account}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">下單時間</span>
                  <span className="font-medium">{new Date(order.created_at).toLocaleString('zh-TW')}</span>
                </div>
                {order.paid_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">付款時間</span>
                    <span className="font-medium">{new Date(order.paid_at).toLocaleString('zh-TW')}</span>
                  </div>
                )}
                {order.completed_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">完成時間</span>
                    <span className="font-medium">{new Date(order.completed_at).toLocaleString('zh-TW')}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold">金額</span>
                  <span className="font-bold text-primary-600">NT${order.total_amount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {order.items?.length > 0 && (
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">服務項目</h2>
                <div className="space-y-3">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-medium text-gray-900">{item.service_name}</div>
                        <div className="text-xs text-gray-400">數量：{item.quantity?.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">NT${item.subtotal?.toLocaleString()}</div>
                        {item.supplier_status && (
                          <span className={`text-xs ${
                            item.supplier_status === 'completed' ? 'text-green-600' :
                            item.supplier_status === 'in_progress' ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            {item.supplier_status === 'completed' ? '已完成' :
                             item.supplier_status === 'in_progress' ? '執行中' : '待處理'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}
