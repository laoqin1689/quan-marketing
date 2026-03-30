'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminCouponsPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', discount_type: 'percentage', discount_value: 10,
    min_order_amount: 0, max_uses: '', utm_source: '', valid_from: '', valid_until: '',
  });

  useEffect(() => {
    const t = localStorage.getItem('qm_admin_token');
    if (!t) { router.push('/admin/'); return; }
    setToken(t);
  }, [router]);

  const fetchCoupons = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_BASE}/api/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push('/admin/'); return; }
      setCoupons(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      const payload = {
        ...form,
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
        utm_source: form.utm_source || null,
      };
      const res = await fetch(`${API_BASE}/api/admin/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) { setShowForm(false); fetchCoupons(); }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要停用此優惠碼？')) return;
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      await fetch(`${API_BASE}/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCoupons();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/admin/dashboard/" className="font-bold text-primary-600">全行銷 Admin</Link>
          <Link href="/admin/orders/" className="text-sm text-gray-600 hover:text-primary-600">訂單</Link>
          <Link href="/admin/categories/" className="text-sm text-gray-600 hover:text-primary-600">產品</Link>
          <Link href="/admin/suppliers/" className="text-sm text-gray-600 hover:text-primary-600">供應商</Link>
          <Link href="/admin/coupons/" className="text-sm text-primary-600 font-medium">優惠碼</Link>
        </div>
        <button onClick={() => { localStorage.removeItem('qm_admin_token'); router.push('/admin/'); }} className="text-sm text-gray-500 hover:text-red-500">登出</button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">優惠碼管理</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm !py-2">
            {showForm ? '取消' : '+ 新增優惠碼'}
          </button>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">新增優惠碼</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">優惠碼</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field !py-2 text-sm" required placeholder="例如 NEW20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">折扣類型</label>
                <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="input-field !py-2 text-sm">
                  <option value="percentage">百分比折扣</option>
                  <option value="fixed">固定金額</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">折扣值</label>
                <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} className="input-field !py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">最低消費 (TWD)</label>
                <input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })} className="input-field !py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">使用上限</label>
                <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} className="input-field !py-2 text-sm" placeholder="留空=無限" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">限定 UTM Source</label>
                <input type="text" value={form.utm_source} onChange={(e) => setForm({ ...form, utm_source: e.target.value })} className="input-field !py-2 text-sm" placeholder="留空=不限" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">有效起始</label>
                <input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} className="input-field !py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">有效截止</label>
                <input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className="input-field !py-2 text-sm" />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <button type="submit" className="btn-primary text-sm !py-2">建立</button>
              </div>
            </form>
          </div>
        )}

        <div className="card !p-0 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-400">載入中...</div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 text-gray-400">暫無優惠碼</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">優惠碼</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">折扣</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">最低消費</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">使用次數</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">限定來源</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">有效期限</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">狀態</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c: any) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                      <td className="px-4 py-3">
                        {c.discount_type === 'percentage' ? `${c.discount_value}%` : `NT$${c.discount_value}`}
                      </td>
                      <td className="px-4 py-3 text-right">NT${c.min_order_amount}</td>
                      <td className="px-4 py-3 text-center">{c.current_uses} / {c.max_uses || '∞'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{c.utm_source || '不限'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {c.valid_until ? new Date(c.valid_until).toLocaleDateString('zh-TW') : '永久'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={c.is_active ? 'badge-success' : 'badge-error'}>
                          {c.is_active ? '啟用' : '停用'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {c.is_active && (
                          <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 hover:text-red-700">停用</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
