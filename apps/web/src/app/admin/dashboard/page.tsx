'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('qm_admin_token');
    if (!t) { router.push('/admin/'); return; }
    setToken(t);

    const fetchData = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${API_BASE}/api/admin/dashboard/overview`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (res.status === 401) { localStorage.removeItem('qm_admin_token'); router.push('/admin/'); return; }
        setData(await res.json());
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('qm_admin_token');
    router.push('/admin/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/admin/dashboard/" className="font-bold text-primary-600">全行銷 Admin</Link>
          <Link href="/admin/orders/" className="text-sm text-gray-600 hover:text-primary-600">訂單</Link>
          <Link href="/admin/categories/" className="text-sm text-gray-600 hover:text-primary-600">產品</Link>
          <Link href="/admin/suppliers/" className="text-sm text-gray-600 hover:text-primary-600">供應商</Link>
          <Link href="/admin/coupons/" className="text-sm text-gray-600 hover:text-primary-600">優惠碼</Link>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">登出</button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">儀表板</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-400">載入中...</div>
        ) : data ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="card">
                <div className="text-sm text-gray-500">今日營收</div>
                <div className="text-2xl font-bold text-primary-600">NT${(data.today?.revenue || 0).toLocaleString()}</div>
                <div className="text-xs text-gray-400">{data.today?.orders || 0} 筆訂單</div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-500">30 日營收</div>
                <div className="text-2xl font-bold text-green-600">NT${(data.month?.revenue || 0).toLocaleString()}</div>
                <div className="text-xs text-gray-400">{data.month?.orders || 0} 筆訂單</div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-500">待處理訂單</div>
                <div className="text-2xl font-bold text-yellow-600">{data.pending_orders || 0}</div>
              </div>
              <div className="card">
                <div className="text-sm text-gray-500">30 日獨立客戶</div>
                <div className="text-2xl font-bold text-accent-600">{data.month?.unique_customers || 0}</div>
              </div>
            </div>

            {/* Channel Revenue */}
            {data.channel_revenue?.length > 0 && (
              <div className="card mb-6">
                <h2 className="font-bold text-gray-900 mb-4">渠道營收（30 日）</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-500 font-medium">渠道</th>
                        <th className="text-right py-2 text-gray-500 font-medium">訂單數</th>
                        <th className="text-right py-2 text-gray-500 font-medium">營收</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.channel_revenue.map((ch: any, i: number) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2 font-medium">{ch.utm_source || '直接流量'}</td>
                          <td className="py-2 text-right">{ch.orders}</td>
                          <td className="py-2 text-right font-medium">NT${ch.revenue?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Platform Revenue */}
            {data.platform_revenue?.length > 0 && (
              <div className="card">
                <h2 className="font-bold text-gray-900 mb-4">平台營收（30 日）</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-500 font-medium">平台</th>
                        <th className="text-right py-2 text-gray-500 font-medium">訂單數</th>
                        <th className="text-right py-2 text-gray-500 font-medium">營收</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.platform_revenue.map((p: any, i: number) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2 font-medium">{p.social_platform || '未知'}</td>
                          <td className="py-2 text-right">{p.orders}</td>
                          <td className="py-2 text-right font-medium">NT${p.revenue?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">無法載入數據</div>
        )}
      </div>
    </div>
  );
}
