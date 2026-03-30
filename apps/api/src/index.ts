import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './types';
import { categoriesRoute } from './routes/categories';
import { ordersRoute } from './routes/orders';
import { couponsRoute } from './routes/coupons';
import { adminRoute } from './routes/admin';
import { trackingRoute } from './routes/tracking';
import { webhookRoute } from './routes/webhooks';
import { affiliatesRoute } from './routes/affiliates';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['https://quan-marketing.pages.dev', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Anonymous-ID'],
  credentials: true,
}));

// Health check
app.get('/', (c) => c.json({
  name: '全行銷 API',
  version: '1.0.0',
  status: 'healthy',
  timestamp: new Date().toISOString(),
}));

app.get('/health', (c) => c.json({ status: 'ok' }));

// Public API routes
app.route('/api/categories', categoriesRoute);
app.route('/api/orders', ordersRoute);
app.route('/api/coupons', couponsRoute);
app.route('/api/tracking', trackingRoute);
app.route('/api/affiliates', affiliatesRoute);

// Webhook routes (from payment providers, N8N callbacks)
app.route('/api/webhooks', webhookRoute);

// Admin routes (protected)
app.route('/api/admin', adminRoute);

// 404 handler
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
