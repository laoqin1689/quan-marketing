import { Hono } from 'hono';
import type { Env, Category } from '../types';

export const categoriesRoute = new Hono<{ Bindings: Env }>();

// GET /api/categories — 取得所有平台列表
categoriesRoute.get('/', async (c) => {
  const db = c.env.DB;

  // Try cache first
  const cached = await c.env.CACHE.get('categories:platforms', 'json');
  if (cached) return c.json(cached);

  const result = await db.prepare(
    `SELECT DISTINCT platform FROM categories WHERE is_active = 1 ORDER BY sort_order, platform`
  ).all();

  const platforms = result.results?.map((r: any) => r.platform) || [];
  await c.env.CACHE.put('categories:platforms', JSON.stringify(platforms), { expirationTtl: 300 });

  return c.json(platforms);
});

// GET /api/categories/:platform — 取得特定平台的服務類型
categoriesRoute.get('/:platform', async (c) => {
  const platform = c.req.param('platform');
  const db = c.env.DB;

  const cacheKey = `categories:${platform}`;
  const cached = await c.env.CACHE.get(cacheKey, 'json');
  if (cached) return c.json(cached);

  const result = await db.prepare(
    `SELECT DISTINCT service_type FROM categories WHERE platform = ? AND is_active = 1 ORDER BY sort_order, service_type`
  ).bind(platform).all();

  const serviceTypes = result.results?.map((r: any) => r.service_type) || [];
  await c.env.CACHE.put(cacheKey, JSON.stringify(serviceTypes), { expirationTtl: 300 });

  return c.json(serviceTypes);
});

// GET /api/categories/:platform/:serviceType — 取得品質方案列表
categoriesRoute.get('/:platform/:serviceType', async (c) => {
  const { platform, serviceType } = c.req.param();
  const db = c.env.DB;

  const cacheKey = `categories:${platform}:${serviceType}`;
  const cached = await c.env.CACHE.get(cacheKey, 'json');
  if (cached) return c.json(cached);

  const result = await db.prepare(
    `SELECT id, platform, service_type, quality, region, display_name, description,
            base_price_twd, min_quantity, max_quantity
     FROM categories
     WHERE platform = ? AND service_type = ? AND is_active = 1
     ORDER BY sort_order, quality`
  ).bind(platform, serviceType).all();

  const categories = result.results || [];
  await c.env.CACHE.put(cacheKey, JSON.stringify(categories), { expirationTtl: 300 });

  return c.json(categories);
});

// GET /api/categories/search?q=xxx — 搜尋服務
categoriesRoute.get('/search', async (c) => {
  const query = c.req.query('q') || '';
  if (query.length < 2) return c.json([]);

  const db = c.env.DB;
  const result = await db.prepare(
    `SELECT id, platform, service_type, quality, region, display_name, description, base_price_twd, min_quantity, max_quantity
     FROM categories
     WHERE is_active = 1 AND (display_name LIKE ? OR platform LIKE ? OR service_type LIKE ?)
     ORDER BY sort_order LIMIT 20`
  ).bind(`%${query}%`, `%${query}%`, `%${query}%`).all();

  return c.json(result.results || []);
});
