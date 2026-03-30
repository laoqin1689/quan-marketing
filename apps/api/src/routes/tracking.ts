import { Hono } from 'hono';
import type { Env } from '../types';

export const trackingRoute = new Hono<{ Bindings: Env }>();

// POST /api/tracking/event — 記錄前端事件
trackingRoute.post('/event', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json<{
    anonymous_id: string;
    event_name: string;
    properties?: Record<string, any>;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    page_url?: string;
    referrer?: string;
  }>();

  if (!body.anonymous_id || !body.event_name) {
    return c.json({ error: 'anonymous_id and event_name are required' }, 400);
  }

  await db.prepare(
    `INSERT INTO events (anonymous_id, event_name, properties, utm_source, utm_medium, utm_campaign,
      page_url, referrer, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    body.anonymous_id,
    body.event_name,
    body.properties ? JSON.stringify(body.properties) : null,
    body.utm_source || null,
    body.utm_medium || null,
    body.utm_campaign || null,
    body.page_url || null,
    body.referrer || null,
    c.req.header('CF-Connecting-IP') || null,
    c.req.header('User-Agent') || null
  ).run();

  return c.json({ success: true });
});

// POST /api/tracking/identify — 將匿名 ID 與 email 綁定
trackingRoute.post('/identify', async (c) => {
  const db = c.env.DB;
  const { anonymous_id, email } = await c.req.json<{ anonymous_id: string; email: string }>();

  if (!anonymous_id || !email) {
    return c.json({ error: 'anonymous_id and email are required' }, 400);
  }

  // Check if user exists with this email
  const existingUser = await db.prepare(
    'SELECT id, anonymous_id FROM users WHERE email = ?'
  ).bind(email).first<any>();

  if (existingUser && existingUser.anonymous_id !== anonymous_id) {
    // Merge: update all events and touchpoints from old anonymous_id to existing user
    await db.prepare(
      'UPDATE events SET user_id = ? WHERE anonymous_id = ? AND user_id IS NULL'
    ).bind(existingUser.id, anonymous_id).run();

    await db.prepare(
      'UPDATE user_touchpoints SET user_id = ? WHERE anonymous_id = ?'
    ).bind(existingUser.id, anonymous_id).run();

    // Update last touch UTM
    const latestTouch = await db.prepare(
      'SELECT utm_source, utm_medium, utm_campaign FROM user_touchpoints WHERE user_id = ? ORDER BY touched_at DESC LIMIT 1'
    ).bind(existingUser.id).first<any>();

    if (latestTouch) {
      await db.prepare(
        'UPDATE users SET last_touch_utm = ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).bind(JSON.stringify(latestTouch), existingUser.id).run();
    }
  } else if (!existingUser) {
    // Check if anonymous_id user exists
    const anonUser = await db.prepare(
      'SELECT id FROM users WHERE anonymous_id = ?'
    ).bind(anonymous_id).first<any>();

    if (anonUser) {
      await db.prepare(
        'UPDATE users SET email = ?, updated_at = datetime(\'now\') WHERE id = ?'
      ).bind(email, anonUser.id).run();
    }
  }

  return c.json({ success: true });
});
