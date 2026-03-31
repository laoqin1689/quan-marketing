import { Hono } from 'hono';
import type { Env } from '../types';

export const webhookRoute = new Hono<{ Bindings: Env }>();

// POST /api/webhooks/payment — 金流回調（ECPay / NewebPay）
webhookRoute.post('/payment', async (c) => {
  const db = c.env.DB;
  const body = await c.req.text();

  // Parse payment callback (ECPay format example)
  const params = new URLSearchParams(body);
  const merchantTradeNo = params.get('MerchantTradeNo') || '';
  const rtnCode = params.get('RtnCode') || '';
  const tradeNo = params.get('TradeNo') || '';
  const tradeAmt = params.get('TradeAmt') || '0';

  // Record payment
  const order = await db.prepare(
    'SELECT id, user_id, total_amount, anonymous_id, fbclid, gclid, ttclid, social_account, social_platform FROM orders WHERE order_number = ?'
  ).bind(merchantTradeNo).first<any>();

  if (!order) {
    return c.text('0|OrderNotFound');
  }

  await db.prepare(
    `INSERT INTO payments (order_id, payment_method, transaction_id, amount, status, raw_response)
     VALUES (?, 'ecpay', ?, ?, ?, ?)`
  ).bind(order.id, tradeNo, parseFloat(tradeAmt), rtnCode === '1' ? 'success' : 'failed', body).run();

  if (rtnCode === '1') {
    // Payment success
    await db.prepare(
      `UPDATE orders SET status = 'paid', paid_at = datetime('now'), payment_method = 'ecpay' WHERE id = ?`
    ).bind(order.id).run();

    // Update user stats
    await db.prepare(
      `UPDATE users SET total_spent = total_spent + ?, order_count = order_count + 1, updated_at = datetime('now') WHERE id = ?`
    ).bind(order.total_amount, order.user_id).run();

    // Get user email
    const user = await db.prepare('SELECT email FROM users WHERE id = ?').bind(order.user_id).first<{ email: string }>();

    // Get order items (including extra_data for dynamic form fields)
    const items = await db.prepare(
      `SELECT oi.id as item_id, oi.category_id, oi.service_name, oi.quantity, oi.extra_data,
              sr.route_id
       FROM order_items oi
       LEFT JOIN supplier_routes sr ON sr.category_id = oi.category_id AND sr.priority = 1
       WHERE oi.order_id = ?`
    ).bind(order.id).all();

    // Trigger N8N: supplier order workflow
    if (c.env.N8N_WEBHOOK_BASE_URL) {
      try {
        await fetch(`${c.env.N8N_WEBHOOK_BASE_URL}/webhook/order-paid`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: order.id,
            order_number: merchantTradeNo,
            items: (items.results || []).map((item: any) => ({
              item_id: item.item_id,
              category_id: item.category_id,
              service_name: item.service_name,
              quantity: item.quantity,
              route_id: item.route_id,
              extra_data: item.extra_data ? JSON.parse(item.extra_data) : null,
            })),
            user_email: user?.email,
            social_account: order.social_account,
            social_platform: order.social_platform,
          }),
        });

        // Trigger N8N: CAPI workflow
        await fetch(`${c.env.N8N_WEBHOOK_BASE_URL}/webhook/purchase-capi`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: order.id,
            order_number: merchantTradeNo,
            total_amount: order.total_amount,
            currency: 'TWD',
            user_email: user?.email,
            fbclid: order.fbclid,
            gclid: order.gclid,
            ttclid: order.ttclid,
            anonymous_id: order.anonymous_id,
          }),
        });
      } catch (err) {
        console.error('N8N webhook error:', err);
      }
    }
  }

  return c.text('1|OK');
});

// POST /api/webhooks/n8n/order-status — N8N 回報供應商訂單狀態
webhookRoute.post('/n8n/order-status', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{
    order_item_id: number;
    supplier_order_id: string;
    supplier_id: number;
    status: string;
    start_count?: number;
    current_count?: number;
    remains?: number;
  }>();

  await db.prepare(
    `UPDATE order_items SET supplier_order_id = ?, supplier_id = ?, supplier_status = ?,
      start_count = ?, current_count = ?, remains = ?
     WHERE id = ?`
  ).bind(
    body.supplier_order_id, body.supplier_id, body.status,
    body.start_count || null, body.current_count || null, body.remains || null,
    body.order_item_id
  ).run();

  // Check if all items are completed
  const orderItem = await db.prepare(
    'SELECT order_id FROM order_items WHERE id = ?'
  ).bind(body.order_item_id).first<{ order_id: number }>();

  if (orderItem) {
    const pendingItems = await db.prepare(
      `SELECT COUNT(*) as count FROM order_items WHERE order_id = ? AND supplier_status != 'completed'`
    ).bind(orderItem.order_id).first<{ count: number }>();

    if (pendingItems && pendingItems.count === 0) {
      await db.prepare(
        `UPDATE orders SET status = 'completed', completed_at = datetime('now') WHERE id = ?`
      ).bind(orderItem.order_id).run();
    } else if (body.status === 'in_progress' || body.status === 'processing') {
      await db.prepare(
        `UPDATE orders SET status = 'in_progress' WHERE id = ? AND status = 'paid'`
      ).bind(orderItem.order_id).run();
    }
  }

  return c.json({ success: true });
});

// POST /api/webhooks/n8n/capi-status — N8N 回報 CAPI 發送狀態
webhookRoute.post('/n8n/capi-status', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{
    order_id: number;
    platform: 'facebook' | 'google' | 'tiktok';
    success: boolean;
  }>();

  const field = body.platform === 'facebook' ? 'fb_capi_sent' :
                body.platform === 'google' ? 'google_api_sent' : 'tiktok_api_sent';

  await db.prepare(
    `UPDATE orders SET ${field} = ? WHERE id = ?`
  ).bind(body.success ? 1 : 0, body.order_id).run();

  return c.json({ success: true });
});
