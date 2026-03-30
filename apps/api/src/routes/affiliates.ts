import { Hono } from 'hono';
import type { Env } from '../types';

export const affiliatesRoute = new Hono<{ Bindings: Env }>();

// GET /api/affiliates/:refCode/stats — 查詢推薦人統計
affiliatesRoute.get('/:refCode/stats', async (c) => {
  const refCode = c.req.param('refCode');
  const db = c.env.DB;

  const affiliate = await db.prepare(
    `SELECT a.ref_code, a.commission_rate, a.total_earnings, a.pending_balance, a.available_balance, a.created_at,
            (SELECT COUNT(*) FROM orders WHERE ref_code = a.ref_code AND status != 'cancelled') as total_orders,
            (SELECT SUM(total_amount) FROM orders WHERE ref_code = a.ref_code AND status = 'completed') as total_revenue
     FROM affiliates a WHERE a.ref_code = ?`
  ).bind(refCode).first<any>();

  if (!affiliate) {
    return c.json({ error: '推薦碼不存在' }, 404);
  }

  return c.json(affiliate);
});

// GET /api/affiliates/:refCode/commissions — 查詢佣金記錄
affiliatesRoute.get('/:refCode/commissions', async (c) => {
  const refCode = c.req.param('refCode');
  const db = c.env.DB;

  const affiliate = await db.prepare(
    'SELECT id FROM affiliates WHERE ref_code = ?'
  ).bind(refCode).first<{ id: number }>();

  if (!affiliate) return c.json({ error: '推薦碼不存在' }, 404);

  const commissions = await db.prepare(
    `SELECT c.amount, c.level, c.status, c.created_at, o.order_number, o.total_amount
     FROM commissions c
     JOIN orders o ON o.id = c.order_id
     WHERE c.affiliate_id = ?
     ORDER BY c.created_at DESC LIMIT 50`
  ).bind(affiliate.id).all();

  return c.json(commissions.results || []);
});
