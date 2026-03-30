'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const statusLabels: Record<string, { label: string; class: string }> = {
  awaiting_payment: { label: '待付款', class: 'badge-warning' },
  paid: { label: '已付款', class: 'badge-info' },
  processing: { label: '處理中', class: 'badge-info' },
  in_progress: { label: '執行中', class: 'badge-info' },
  completed: { label: '已完成', class: 'badge-success' },
  cancelled: { label: '已取消', class: 'badge-error' },
  refunded: { label: '已退款', class: 'badge-error' },
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('qm_admin_token');
    if (!t) { router.push('/admin/'); return; }
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
        const params = new URLSearchParams({ page: String(page), limit: '20' });
        if (statusFilter) params.set('status', statusFilter);
        const res = await fetch(`${API_BASE}/api/admin/orders?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) { localStorage.removeItem('qm_admin_token'); router.push('/admin/'); return; }
        const data = await res.json();
        setOrders(data.orders || []);
        setTotal(data.total || 0);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchOrders();
  }, [token, page, statusFilter, router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/admin/dashboard/" className="font-bold text-primary-600">全行銷 Admin</Link>
          <Link href="/admin/orders/" className="text-sm text-primary-600 font-medium">訂單</Link>
          <Link href="/admin/categories/" className="text-sm text-gray-600 hover:text-primary-600">產品</Link>
          <Link href="/admin/suppliers/" className="text-sm text-gray-600 hover:text-primary-600">供應商</Link>
          <Link href="/admin/coupons/" className="text-sm text-gray-600 hover:text-primary-600">優惠碼</Link>
        </div>
        <button onClick={() => { localStorage.removeItem('qm_admin_token'); router.push('/admin/'); }} className="text-sm text-gray-500 hover:text-red-500">登出</button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">訂單管理</h1>
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="input-field !w-auto !py-2 text-sm"
            >
              <option value="">全部狀態</option>
              <option value="awaiting_payment">待付款</option>
              <option value="paid">已付款</option>
              <option value="in_progress">執行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
        </div>

        <div className="card overflow-hidden !p-0">
          {loading ? (
            <div className="text-center py-12 text-gray-400">載入中...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">暫無訂單</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">訂單編號</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">平台</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">金額</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">狀態</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">來源</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">時間</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => {
                    const st = statusLabels[order.status] || { label: order.status, class: 'badge-info' };
                    return (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs">{order.order_number}</td>
                        <td className="px-4 py-3">{order.email || '-'}</td>
                        <td className="px-4 py-3">{order.social_platform || '-'}</td>
                        <td className="px-4 py-3 text-right font-medium">NT${order.total_amount?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center"><span className={st.class}>{st.label}</span></td>
                        <td className="px-4 py-3 text-xs text-gray-400">{order.utm_source || '直接'}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(order.created_at).toLocaleString('zh-TW')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary !py-2 !px-3 text-sm disabled:opacity-50">上一頁</button>
            <span className="text-sm text-gray-500">第 {page} 頁 / 共 {Math.ceil(total / 20)} 頁</span>
            <button onClick={() => setPage(page + 1)} disabled={page * 20 >= total} className="btn-secondary !py-2 !px-3 text-sm disabled:opacity-50">下一頁</button>
          </div>
        )}
      </div>
    </div>
  );
}
