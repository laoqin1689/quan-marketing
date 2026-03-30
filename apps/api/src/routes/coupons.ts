import { Hono } from 'hono';
import type { Env } from '../types';

export const couponsRoute = new Hono<{ Bindings: Env }>();

// POST /api/coupons/validate — 驗證優惠碼
couponsRoute.post('/validate', async (c) => {
  const { code, order_amount } = await c.req.json<{ code: string; order_amount: number }>();
  const db = c.env.DB;

  if (!code) return c.json({ valid: false, error: '請輸入優惠碼' }, 400);

  const coupon = await db.prepare(
    `SELECT * FROM coupons WHERE code = ? AND is_active = 1
     AND (valid_from IS NULL OR valid_from <= datetime('now'))
     AND (valid_until IS NULL OR valid_until >= datetime('now'))
     AND (max_uses IS NULL OR current_uses < max_uses)`
  ).bind(code.toUpperCase()).first<any>();

  if (!coupon) {
    return c.json({ valid: false, error: '優惠碼無效或已過期' });
  }

  if (order_amount < coupon.min_order_amount) {
    return c.json({
      valid: false,
      error: `訂單金額需滿 NT$${coupon.min_order_amount} 才能使用此優惠碼`
    });
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = Math.round(order_amount * coupon.discount_value / 100);
  } else {
    discount = coupon.discount_value;
  }

  return c.json({
    valid: true,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    discount_amount: discount,
    final_amount: Math.max(0, order_amount - discount),
  });
});
