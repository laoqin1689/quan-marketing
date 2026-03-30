'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminSuppliersPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', api_url: '', api_key: '' });

  useEffect(() => {
    const t = localStorage.getItem('qm_admin_token');
    if (!t) { router.push('/admin/'); return; }
    setToken(t);
  }, [router]);

  const fetchSuppliers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_BASE}/api/admin/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { router.push('/admin/'); return; }
      setSuppliers(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchSuppliers(); }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${API_BASE}/api/admin/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { setShowForm(false); setForm({ name: '', api_url: '', api_key: '' }); fetchSuppliers(); }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/admin/dashboard/" className="font-bold text-primary-600">全行銷 Admin</Link>
          <Link href="/admin/orders/" className="text-sm text-gray-600 hover:text-primary-600">訂單</Link>
          <Link href="/admin/categories/" className="text-sm text-gray-600 hover:text-primary-600">產品</Link>
          <Link href="/admin/suppliers/" className="text-sm text-primary-600 font-medium">供應商</Link>
          <Link href="/admin/coupons/" className="text-sm text-gray-600 hover:text-primary-600">優惠碼</Link>
        </div>
        <button onClick={() => { localStorage.removeItem('qm_admin_token'); router.push('/admin/'); }} className="text-sm text-gray-500 hover:text-red-500">登出</button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">供應商管理</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm !py-2">
            {showForm ? '取消' : '+ 新增供應商'}
          </button>
        </div>

        {showForm && (
          <div className="card mb-6">
            <h2 className="font-bold text-gray-900 mb-4">新增供應商</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">名稱</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field !py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">API URL</label>
                <input type="url" value={form.api_url} onChange={(e) => setForm({ ...form, api_url: e.target.value })} className="input-field !py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">API Key</label>
                <input type="text" value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} className="input-field !py-2 text-sm" required />
              </div>
              <div className="sm:col-span-3">
                <button type="submit" className="btn-primary text-sm !py-2">建立</button>
              </div>
            </form>
          </div>
        )}

        <div className="card !p-0 overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-400">載入中...</div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">暫無供應商</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">名稱</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">API URL</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">狀態</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">餘額</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">最後檢查</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s: any) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{s.id}</td>
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{s.api_url}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={s.is_active ? 'badge-success' : 'badge-error'}>
                          {s.is_active ? '正常' : '停用'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{s.balance ? `$${s.balance}` : '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {s.last_health_check ? new Date(s.last_health_check).toLocaleString('zh-TW') : '尚未檢查'}
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
