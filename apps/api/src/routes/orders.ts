import { Hono } from 'hono';
import type { Env, CreateOrderRequest } from '../types';

export const ordersRoute = new Hono<{ Bindings: Env }>();

// Helper: generate order number
function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `QM${dateStr}${rand}`;
}

// POST /api/orders — 建立新訂單（免註冊）
ordersRoute.post('/', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<CreateOrderRequest>();

  // Validate required fields
  if (!body.social_account || !body.email || !body.items?.length) {
    return c.json({ error: '請填寫社群帳號、Email 和至少一個服務項目' }, 400);
  }

  try {
    const orderNumber = generateOrderNumber();
    const anonymousId = body.anonymous_id || crypto.randomUUID();

    // 1. Find or create user by anonymous_id + email
    let user = await db.prepare(
      'SELECT id FROM users WHERE email = ? OR anonymous_id = ? LIMIT 1'
    ).bind(body.email, anonymousId).first<{ id: number }>();

    if (!user) {
      const utmData = JSON.stringify({
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        utm_term: body.utm_term,
        utm_content: body.utm_content,
      });

      await db.prepare(
        `INSERT INTO users (anonymous_id, email, first_touch_utm, last_touch_utm)
         VALUES (?, ?, ?, ?)`
      ).bind(anonymousId, body.email, utmData, utmData).run();

      user = await db.prepare('SELECT id FROM users WHERE anonymous_id = ?').bind(anonymousId).first<{ id: number }>();
    }

    // 2. Calculate total amount
    let totalAmount = 0;
    const itemDetails: { category_id: number; quantity: number; unit_price: number; subtotal: number; service_name: string }[] = [];

    for (const item of body.items) {
      const category = await db.prepare(
        'SELECT id, display_name, base_price_twd, min_quantity, max_quantity FROM categories WHERE id = ? AND is_active = 1'
      ).bind(item.category_id).first<any>();

      if (!category) {
        return c.json({ error: `服務 ID ${item.category_id} 不存在` }, 400);
      }

      if (item.quantity < category.min_quantity || item.quantity > category.max_quantity) {
        return c.json({
          error: `${category.display_name} 的數量需在 ${category.min_quantity} ~ ${category.max_quantity} 之間`
        }, 400);
      }

      const unitPrice = category.base_price_twd / 1000; // price per unit
      const subtotal = Math.round(unitPrice * item.quantity * 100) / 100;
      totalAmount += subtotal;

      itemDetails.push({
        category_id: item.category_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal,
        service_name: category.display_name,
      });
    }

    // 3. Apply coupon if provided
    let discountAmount = 0;
    if (body.coupon_code) {
      const coupon = await db.prepare(
        `SELECT * FROM coupons WHERE code = ? AND is_active = 1
         AND (valid_from IS NULL OR valid_from <= datetime('now'))
         AND (valid_until IS NULL OR valid_until >= datetime('now'))
         AND (max_uses IS NULL OR current_uses < max_uses)`
      ).bind(body.coupon_code).first<any>();

      if (coupon) {
        if (totalAmount >= coupon.min_order_amount) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = Math.round(totalAmount * coupon.discount_value / 100 * 100) / 100;
          } else {
            discountAmount = coupon.discount_value;
          }
          // Update coupon usage
          await db.prepare('UPDATE coupons SET current_uses = current_uses + 1 WHERE id = ?').bind(coupon.id).run();
        }
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // 4. Create order
    await db.prepare(
      `INSERT INTO orders (order_number, user_id, status, total_amount, currency, social_account, social_platform,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content, fbclid, gclid, ttclid,
        ref_code, coupon_code, discount_amount, anonymous_id, ip_address, user_agent)
       VALUES (?, ?, 'awaiting_payment', ?, 'TWD', ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?)`
    ).bind(
      orderNumber, user!.id, finalAmount, body.social_account, body.social_platform,
      body.utm_source || null, body.utm_medium || null, body.utm_campaign || null,
      body.utm_term || null, body.utm_content || null,
      body.fbclid || null, body.gclid || null, body.ttclid || null,
      body.ref_code || null, body.coupon_code || null, discountAmount,
      anonymousId, c.req.header('CF-Connecting-IP') || null, c.req.header('User-Agent') || null
    ).run();

    const order = await db.prepare('SELECT id FROM orders WHERE order_number = ?').bind(orderNumber).first<{ id: number }>();

    // 5. Create order items
    for (const item of itemDetails) {
      await db.prepare(
        `INSERT INTO order_items (order_id, category_id, service_name, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(order!.id, item.category_id, item.service_name, item.quantity, item.unit_price, item.subtotal);
    }

    // 6. Record touchpoint
    await db.prepare(
      `INSERT INTO user_touchpoints (user_id, anonymous_id, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        click_id, click_id_type, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      user!.id, anonymousId,
      body.utm_source || null, body.utm_medium || null, body.utm_campaign || null,
      body.utm_term || null, body.utm_content || null,
      body.fbclid || body.gclid || body.ttclid || null,
      body.fbclid ? 'fbclid' : body.gclid ? 'gclid' : body.ttclid ? 'ttclid' : null,
      c.req.header('CF-Connecting-IP') || null, c.req.header('User-Agent') || null
    ).run();

    // 7. Handle referral
    if (body.ref_code) {
      const affiliate = await db.prepare(
        'SELECT id FROM affiliates WHERE ref_code = ?'
      ).bind(body.ref_code).first<{ id: number }>();

      if (affiliate) {
        // Commission will be calculated after payment via N8N
      }
    }

    // 8. Track event
    await db.prepare(
      `INSERT INTO events (anonymous_id, user_id, event_name, properties, utm_source, utm_medium, utm_campaign, ip_address, user_agent)
       VALUES (?, ?, 'checkout_initiated', ?, ?, ?, ?, ?, ?)`
    ).bind(
      anonymousId, user!.id,
      JSON.stringify({ order_number: orderNumber, total_amount: finalAmount }),
      body.utm_source || null, body.utm_medium || null, body.utm_campaign || null,
      c.req.header('CF-Connecting-IP') || null, c.req.header('User-Agent') || null
    ).run();

    return c.json({
      order_number: orderNumber,
      status: 'awaiting_payment',
      total_amount: finalAmount,
      discount_amount: discountAmount,
      items: itemDetails,
    }, 201);

  } catch (error: any) {
    console.error('Create order error:', error);
    return c.json({ error: '建立訂單失敗，請稍後再試' }, 500);
  }
});

// GET /api/orders/:orderNumber — 查詢訂單狀態
ordersRoute.get('/:orderNumber', async (c) => {
  const orderNumber = c.req.param('orderNumber');
  const db = c.env.DB;

  const order = await db.prepare(
    `SELECT o.order_number, o.status, o.total_amount, o.currency, o.discount_amount,
            o.social_account, o.social_platform, o.created_at, o.paid_at, o.completed_at
     FROM orders o WHERE o.order_number = ?`
  ).bind(orderNumber).first<any>();

  if (!order) {
    return c.json({ error: '訂單不存在' }, 404);
  }

  const items = await db.prepare(
    `SELECT service_name, quantity, unit_price, subtotal, supplier_status, start_count, current_count, remains
     FROM order_items WHERE order_id = (SELECT id FROM orders WHERE order_number = ?)`
  ).bind(orderNumber).all();

  return c.json({
    ...order,
    items: items.results || [],
  });
});

// POST /api/orders/:orderNumber/simulate-payment — 模擬付款成功（開發用）
ordersRoute.post('/:orderNumber/simulate-payment', async (c) => {
  const orderNumber = c.req.param('orderNumber');
  const db = c.env.DB;

  const order = await db.prepare(
    'SELECT id, status, user_id, total_amount, anonymous_id, fbclid, gclid, ttclid FROM orders WHERE order_number = ?'
  ).bind(orderNumber).first<any>();

  if (!order) return c.json({ error: '訂單不存在' }, 404);
  if (order.status !== 'awaiting_payment') return c.json({ error: '訂單狀態不正確' }, 400);

  // Update order status
  await db.prepare(
    `UPDATE orders SET status = 'paid', paid_at = datetime('now') WHERE order_number = ?`
  ).bind(orderNumber).run();

  // Get user email
  const user = await db.prepare('SELECT email FROM users WHERE id = ?').bind(order.user_id).first<{ email: string }>();

  // Get order items for N8N
  const items = await db.prepare(
    `SELECT oi.id as item_id, oi.category_id, oi.service_name, oi.quantity,
            sr.route_id
     FROM order_items oi
     LEFT JOIN supplier_routes sr ON sr.category_id = oi.category_id AND sr.priority = 1
     WHERE oi.order_id = ?`
  ).bind(order.id).all();

  // Send to N8N via webhook for supplier order processing
  try {
    const n8nPayload = {
      order_id: order.id,
      order_number: orderNumber,
      items: (items.results || []).map((item: any) => ({
        item_id: item.item_id,
        category_id: item.category_id,
        service_name: item.service_name,
        quantity: item.quantity,
        route_id: item.route_id,
      })),
      user_email: user?.email,
      social_account: order.social_account,
      social_platform: order.social_platform,
    };

    // Trigger N8N supplier order workflow
    if (c.env.N8N_WEBHOOK_BASE_URL) {
      await fetch(`${c.env.N8N_WEBHOOK_BASE_URL}/webhook/order-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload),
      });
    }

    // Trigger N8N CAPI workflow
    const capiPayload = {
      order_id: order.id,
      order_number: orderNumber,
      total_amount: order.total_amount,
      currency: 'TWD',
      user_email: user?.email,
      fbclid: order.fbclid,
      gclid: order.gclid,
      ttclid: order.ttclid,
      anonymous_id: order.anonymous_id,
    };

    if (c.env.N8N_WEBHOOK_BASE_URL) {
      await fetch(`${c.env.N8N_WEBHOOK_BASE_URL}/webhook/purchase-capi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(capiPayload),
      });
    }
  } catch (err) {
    console.error('N8N webhook error:', err);
  }

  // Track purchase event
  await db.prepare(
    `INSERT INTO events (anonymous_id, user_id, event_name, properties, ip_address, user_agent)
     VALUES (?, ?, 'purchase', ?, ?, ?)`
  ).bind(
    order.anonymous_id, order.user_id,
    JSON.stringify({ order_number: orderNumber, total_amount: order.total_amount }),
    c.req.header('CF-Connecting-IP') || null, c.req.header('User-Agent') || null
  ).run();

  return c.json({ status: 'paid', message: '付款成功，訂單處理中' });
});
