const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://quan-marketing-api.laoqin1689.workers.dev';

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error((error as any).error || `API Error: ${res.status}`);
  }

  return res.json();
}

// Categories
export const getPlatforms = () => fetchAPI<string[]>('/api/categories');
export const getServiceTypes = (platform: string) => fetchAPI<string[]>(`/api/categories/${encodeURIComponent(platform)}`);
export const getCategories = (platform: string, serviceType: string) =>
  fetchAPI<any[]>(`/api/categories/${encodeURIComponent(platform)}/${encodeURIComponent(serviceType)}`);

// Orders
export const createOrder = (data: any) => fetchAPI<any>('/api/orders', { method: 'POST', body: JSON.stringify(data) });
export const getOrderStatus = (orderNumber: string) => fetchAPI<any>(`/api/orders/${orderNumber}`);

// Coupons
export const validateCoupon = (code: string, orderAmount: number) =>
  fetchAPI<any>('/api/coupons/validate', { method: 'POST', body: JSON.stringify({ code, order_amount: orderAmount }) });

// Tracking
export const trackEvent = (data: { anonymous_id: string; event_name: string; properties?: any; utm_source?: string; utm_medium?: string; utm_campaign?: string; page_url?: string; referrer?: string }) =>
  fetchAPI<any>('/api/tracking/event', { method: 'POST', body: JSON.stringify(data) });

export const identifyUser = (anonymous_id: string, email: string) =>
  fetchAPI<any>('/api/tracking/identify', { method: 'POST', body: JSON.stringify({ anonymous_id, email }) });

// Admin
export const adminLogin = (username: string, password: string) =>
  fetchAPI<{ token: string }>('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const adminFetch = <T>(path: string, token: string, options?: RequestInit) =>
  fetchAPI<T>(path, { ...options, headers: { ...options?.headers, Authorization: `Bearer ${token}` } });
