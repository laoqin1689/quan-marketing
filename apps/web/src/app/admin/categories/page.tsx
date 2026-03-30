'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    platform: 'Instagram', service_type: 'Followers', quality: 'Standard', region: 'Global',
    display_name: '', description: '', base_price_twd: 30, min_quantity: 100, max_quantity: 50000, sort_order: 0,
  });

  useEffect(() => {
    const t = localStorage.getItem('qm_admin_token');
    if (!t) { router.push('/admin/'); return; }
    setToken(t);
  }, [router]);

  const fetchCategories = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_BASE}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push('/admin/'); return; }
      setCategories(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_BASE}/api/admin/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { setShowForm(false); fetchCategories(); }
    } catch (e) { console.error(e); }
  };

  // Group by platform
  const grouped = categories.reduce((acc: Record<string, any[]>, cat) => {
    (acc[cat.platform] = acc[cat.platform] || []).push(cat);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/admin/dashboard/" className="font-bold text-primary-600">全行銷 Admin</Link>
          <Link href="/admin/orders/" className="text-sm text-gray-600 hover:text-primary-600">訂單</Link>
          <Link href="/admin/categories/" className="text-sm text-primary-600 font-medium">產品</Link>
          <Link href="/admin/suppliers/" className="text-sm text-gray-600 hover:text-primary-600">供應商</Link>
          <Link href="/admin/coupons/" className="text-sm text-gray-600 hover:text-primary-600">優惠碼</Link>
        </div>
        <button onClick={() => { localStorage.removeItem('qm_admin_token'); router.push('/admin/'); }} className="text-sm text-gray-500 hover:text-red-500">登出</button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">產品分類管理</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm !py-2">
            {showForm ? '取消' : '+ 新增產品'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">新增產品</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">平台</label>
                <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="input-field !py-2 text-sm">
                  {['Instagram', 'Facebook', 'YouTube', 'TikTok', 'Google', 'Threads', 'LINE'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">服務類型</label>
                <select value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} className="input-field !py-2 text-sm">
                  {['Followers', 'Likes', 'Views', 'Comments', 'Reviews', 'Shares'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">品質</label>
                <select value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })} className="input-field !py-2 text-sm">
                  {['Economy', 'Standard', 'HQ', 'Premium'].map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">顯示名稱</label>
                <input type="text" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="input-field !py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">每千價格 (TWD)</label>
                <input type="number" value={form.base_price_twd} onChange={(e) => setForm({ ...form, base_price_twd: Number(e.target.value) })} className="input-field !py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">地區</label>
                <input type="text" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="input-field !py-2 text-sm" />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <button type="submit" className="btn-primary text-sm !py-2">建立</button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">載入中...</div>
        ) : (
          Object.entries(grouped).map(([platform, cats]) => (
            <div key={platform} className="card mb-4 !p-0 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">{platform} <span className="text-sm font-normal text-gray-400">({(cats as any[]).length} 個服務)</span></h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-2 text-gray-500 font-medium">名稱</th>
                      <th className="text-left px-4 py-2 text-gray-500 font-medium">類型</th>
                      <th className="text-left px-4 py-2 text-gray-500 font-medium">品質</th>
                      <th className="text-right px-4 py-2 text-gray-500 font-medium">每千價格</th>
                      <th className="text-center px-4 py-2 text-gray-500 font-medium">數量範圍</th>
                      <th className="text-center px-4 py-2 text-gray-500 font-medium">狀態</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(cats as any[]).map((cat) => (
                      <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{cat.display_name}</td>
                        <td className="px-4 py-2">{cat.service_type}</td>
                        <td className="px-4 py-2">{cat.quality}</td>
                        <td className="px-4 py-2 text-right">NT${cat.base_price_twd}</td>
                        <td className="px-4 py-2 text-center text-xs text-gray-400">{cat.min_quantity?.toLocaleString()} - {cat.max_quantity?.toLocaleString()}</td>
                        <td className="px-4 py-2 text-center">
                          <span className={cat.is_active ? 'badge-success' : 'badge-error'}>
                            {cat.is_active ? '啟用' : '停用'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
