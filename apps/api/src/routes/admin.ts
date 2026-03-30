import { Hono } from 'hono';
import type { Env } from '../types';
import { adminAuth, createAdminSession } from '../middleware/auth';

export const adminRoute = new Hono<{ Bindings: Env }>();

// POST /api/admin/login
adminRoute.post('/login', async (c) => {
  const { username, password } = await c.req.json<{ username: string; password: string }>();

  if (username === c.env.ADMIN_USERNAME && password === c.env.ADMIN_PASSWORD) {
    const token = await createAdminSession(c.env, username);
    return c.json({ token, expires_in: 86400 });
  }

  return c.json({ error: '帳號或密碼錯誤' }, 401);
});

// All routes below require admin auth
adminRoute.use('/*', adminAuth);

// ==================== 訂單管理 ====================

// GET /api/admin/orders — 訂單列表
adminRoute.get('/orders', async (c) => {
  const db = c.env.DB;
  const status = c.req.query('status');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const offset = (page - 1) * limit;

  let query = `SELECT o.*, u.email, u.anonymous_id as user_anonymous_id
               FROM orders o LEFT JOIN users u ON u.id = o.user_id`;
  const params: any[] = [];

  if (status) {
    query += ' WHERE o.status = ?';
    params.push(status);
  }

  query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const result = await db.prepare(query).bind(...params).all();

  // Count total
  let countQuery = 'SELECT COUNT(*) as total FROM orders';
  if (status) countQuery += ' WHERE status = ?';
  const count = status
    ? await db.prepare(countQuery).bind(status).first<{ total: number }>()
    : await db.prepare(countQuery).first<{ total: number }>();

  return c.json({
    orders: result.results || [],
    total: count?.total || 0,
    page,
    limit,
  });
});

// GET /api/admin/orders/:id — 訂單詳情
adminRoute.get('/orders/:id', async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;

  const order = await db.prepare(
    `SELECT o.*, u.email, u.phone, u.member_level
     FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE o.id = ?`
  ).bind(id).first<any>();

  if (!order) return c.json({ error: '訂單不存在' }, 404);

  const items = await db.prepare(
    'SELECT * FROM order_items WHERE order_id = ?'
  ).bind(id).all();

  const payments = await db.prepare(
    'SELECT * FROM payments WHERE order_id = ?'
  ).bind(id).all();

  return c.json({ ...order, items: items.results, payments: payments.results });
});

// ==================== 產品分類管理 ====================

// GET /api/admin/categories
adminRoute.get('/categories', async (c) => {
  const db = c.env.DB;
  const result = await db.prepare(
    'SELECT * FROM categories ORDER BY platform, service_type, quality'
  ).all();
  return c.json(result.results || []);
});

// POST /api/admin/categories
adminRoute.post('/categories', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<any>();

  await db.prepare(
    `INSERT INTO categories (platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.platform, body.service_type, body.quality, body.region || 'Global',
    body.display_name, body.description || null, body.base_price_twd,
    body.min_quantity || 100, body.max_quantity || 100000, body.sort_order || 0
  ).run();

  // Invalidate cache
  await c.env.CACHE.delete('categories:platforms');
  await c.env.CACHE.delete(`categories:${body.platform}`);

  return c.json({ success: true }, 201);
});

// PUT /api/admin/categories/:id
adminRoute.put('/categories/:id', async (c) => {
  const id = c.req.param('id');
  const db = c.env.DB;
  const body = await c.req.json<any>();

  await db.prepare(
    `UPDATE categories SET platform = ?, service_type = ?, quality = ?, region = ?,
      display_name = ?, description = ?, base_price_twd = ?, min_quantity = ?, max_quantity = ?,
      is_active = ?, sort_order = ?
     WHERE id = ?`
  ).bind(
    body.platform, body.service_type, body.quality, body.region,
    body.display_name, body.description, body.base_price_twd,
    body.min_quantity, body.max_quantity, body.is_active ? 1 : 0, body.sort_order, id
  ).run();

  return c.json({ success: true });
});

// ==================== 供應商管理 ====================

// GET /api/admin/suppliers
adminRoute.get('/suppliers', async (c) => {
  const db = c.env.DB;
  const result = await db.prepare('SELECT * FROM suppliers ORDER BY name').all();
  return c.json(result.results || []);
});

// POST /api/admin/suppliers
adminRoute.post('/suppliers', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<any>();

  await db.prepare(
    `INSERT INTO suppliers (name, api_url, api_key) VALUES (?, ?, ?)`
  ).bind(body.name, body.api_url, body.api_key).run();

  return c.json({ success: true }, 201);
});

// GET /api/admin/supplier-routes
adminRoute.get('/supplier-routes', async (c) => {
  const db = c.env.DB;
  const categoryId = c.req.query('category_id');

  let query = `SELECT sr.*, s.name as supplier_name, c.display_name as category_name
               FROM supplier_routes sr
               JOIN suppliers s ON s.id = sr.supplier_id
               JOIN categories c ON c.id = sr.category_id`;

  if (categoryId) {
    query += ` WHERE sr.category_id = ?`;
    const result = await db.prepare(query + ' ORDER BY sr.priority').bind(categoryId).all();
    return c.json(result.results || []);
  }

  const result = await db.prepare(query + ' ORDER BY sr.category_id, sr.priority LIMIT 500').all();
  return c.json(result.results || []);
});

// POST /api/admin/supplier-routes
adminRoute.post('/supplier-routes', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<any>();

  await db.prepare(
    `INSERT INTO supplier_routes (route_id, category_id, priority, supplier_id, supplier_service_id, cost_per_1k, score, has_refill, min_order, max_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.route_id, body.category_id, body.priority, body.supplier_id,
    body.supplier_service_id, body.cost_per_1k, body.score || 0,
    body.has_refill ? 1 : 0, body.min_order || 1, body.max_order || 1000000
  ).run();

  return c.json({ success: true }, 201);
});

// ==================== 優惠碼管理 ====================

// GET /api/admin/coupons
adminRoute.get('/coupons', async (c) => {
  const db = c.env.DB;
  const result = await db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
  return c.json(result.results || []);
});

// POST /api/admin/coupons
adminRoute.post('/coupons', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<any>();

  await db.prepare(
    `INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, utm_source, valid_from, valid_until)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.code.toUpperCase(), body.discount_type, body.discount_value,
    body.min_order_amount || 0, body.max_uses || null,
    body.utm_source || null, body.valid_from || null, body.valid_until || null
  ).run();

  return c.json({ success: true }, 201);
});

// DELETE /api/admin/coupons/:id
adminRoute.delete('/coupons/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare('UPDATE coupons SET is_active = 0 WHERE id = ?').bind(id).run();
  return c.json({ success: true });
});

// ==================== 推薦分潤管理 ====================

// GET /api/admin/affiliates
adminRoute.get('/affiliates', async (c) => {
  const db = c.env.DB;
  const result = await db.prepare(
    `SELECT a.*, u.email,
      (SELECT COUNT(*) FROM orders WHERE ref_code = a.ref_code AND status != 'cancelled') as referral_orders
     FROM affiliates a LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.total_earnings DESC`
  ).all();
  return c.json(result.results || []);
});

// ==================== ROI 儀表板 ====================

// GET /api/admin/dashboard/overview
adminRoute.get('/dashboard/overview', async (c) => {
  const db = c.env.DB;

  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  // Today's stats
  const todayStats = await db.prepare(
    `SELECT COUNT(*) as orders, COALESCE(SUM(total_amount), 0) as revenue
     FROM orders WHERE DATE(created_at) = ? AND status NOT IN ('cancelled')`
  ).bind(today).first<any>();

  // 30-day stats
  const monthStats = await db.prepare(
    `SELECT COUNT(*) as orders, COALESCE(SUM(total_amount), 0) as revenue,
            COUNT(DISTINCT user_id) as unique_customers
     FROM orders WHERE DATE(created_at) >= ? AND status NOT IN ('cancelled')`
  ).bind(thirtyDaysAgo).first<any>();

  // Pending orders
  const pendingOrders = await db.prepare(
    `SELECT COUNT(*) as count FROM orders WHERE status IN ('awaiting_payment', 'paid', 'processing')`
  ).first<{ count: number }>();

  // Revenue by channel (last 30 days)
  const channelRevenue = await db.prepare(
    `SELECT utm_source, COUNT(*) as orders, SUM(total_amount) as revenue
     FROM orders WHERE DATE(created_at) >= ? AND status = 'completed'
     GROUP BY utm_source ORDER BY revenue DESC LIMIT 10`
  ).bind(thirtyDaysAgo).all();

  // Revenue by platform (last 30 days)
  const platformRevenue = await db.prepare(
    `SELECT social_platform, COUNT(*) as orders, SUM(total_amount) as revenue
     FROM orders WHERE DATE(created_at) >= ? AND status NOT IN ('cancelled')
     GROUP BY social_platform ORDER BY revenue DESC`
  ).bind(thirtyDaysAgo).all();

  // Daily revenue trend (last 30 days)
  const dailyRevenue = await db.prepare(
    `SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount) as revenue
     FROM orders WHERE DATE(created_at) >= ? AND status NOT IN ('cancelled')
     GROUP BY DATE(created_at) ORDER BY date`
  ).bind(thirtyDaysAgo).all();

  return c.json({
    today: todayStats,
    month: monthStats,
    pending_orders: pendingOrders?.count || 0,
    channel_revenue: channelRevenue.results || [],
    platform_revenue: platformRevenue.results || [],
    daily_revenue: dailyRevenue.results || [],
  });
});

// GET /api/admin/dashboard/abandoned — 棄單統計
adminRoute.get('/dashboard/abandoned', async (c) => {
  const db = c.env.DB;

  const abandoned = await db.prepare(
    `SELECT COUNT(*) as count, SUM(total_amount) as potential_revenue
     FROM orders WHERE status = 'awaiting_payment'
     AND created_at < datetime('now', '-30 minutes')`
  ).first<any>();

  const recentAbandoned = await db.prepare(
    `SELECT o.order_number, o.total_amount, o.created_at, u.email, o.utm_source
     FROM orders o LEFT JOIN users u ON u.id = o.user_id
     WHERE o.status = 'awaiting_payment'
     AND o.created_at < datetime('now', '-30 minutes')
     ORDER BY o.created_at DESC LIMIT 20`
  ).all();

  return c.json({
    total_abandoned: abandoned?.count || 0,
    potential_revenue: abandoned?.potential_revenue || 0,
    recent: recentAbandoned.results || [],
  });
});
