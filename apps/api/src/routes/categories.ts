import { Hono } from 'hono';
import type { Env } from '../types';

export const categoriesRoute = new Hono<{ Bindings: Env }>();

// GET /api/categories/all — 取得所有服務（一頁式目錄用）
// 回傳所有 662 條服務 + 篩選器元數據
categoriesRoute.get('/all', async (c) => {
  const db = c.env.DB;

  // Try cache first
  const cached = await c.env.CACHE.get('categories:all', 'json');
  if (cached) return c.json(cached);

  // Fetch all active categories
  const result = await db.prepare(
    `SELECT id, platform, service_type, quality, region, display_name, description,
            base_price_twd, min_quantity, max_quantity, delivery_estimate,
            has_warranty, is_popular, sort_order, required_fields
     FROM categories
     WHERE is_active = 1
     ORDER BY sort_order, platform, service_type`
  ).all();

  const categories = result.results || [];

  // Build filter metadata
  const platforms = new Map<string, number>();
  const serviceTypes = new Map<string, number>();
  const qualities = new Map<string, number>();

  for (const cat of categories as any[]) {
    platforms.set(cat.platform, (platforms.get(cat.platform) || 0) + 1);
    serviceTypes.set(cat.service_type, (serviceTypes.get(cat.service_type) || 0) + 1);
    qualities.set(cat.quality, (qualities.get(cat.quality) || 0) + 1);
  }

  const response = {
    categories,
    filters: {
      platforms: Array.from(platforms.entries()).map(([name, count]) => ({ name, count })),
      serviceTypes: Array.from(serviceTypes.entries()).map(([name, count]) => ({ name, count })),
      qualities: Array.from(qualities.entries()).map(([name, count]) => ({ name, count })),
    },
    total: categories.length,
  };

  // Cache for 5 minutes
  await c.env.CACHE.put('categories:all', JSON.stringify(response), { expirationTtl: 300 });

  return c.json(response);
});

// GET /api/categories — 取得所有平台列表 (backward compatible)
categoriesRoute.get('/', async (c) => {
  const db = c.env.DB;

  const cached = await c.env.CACHE.get('categories:platforms', 'json');
  if (cached) return c.json(cached);

  const result = await db.prepare(
    `SELECT DISTINCT platform FROM categories WHERE is_active = 1 ORDER BY sort_order, platform`
  ).all();

  const platforms = result.results?.map((r: any) => r.platform) || [];
  await c.env.CACHE.put('categories:platforms', JSON.stringify(platforms), { expirationTtl: 300 });

  return c.json(platforms);
});

// GET /api/categories/search?q=xxx — 搜尋服務
categoriesRoute.get('/search', async (c) => {
  const query = c.req.query('q') || '';
  if (query.length < 1) return c.json([]);

  const db = c.env.DB;
  const result = await db.prepare(
    `SELECT id, platform, service_type, quality, region, display_name, description,
            base_price_twd, min_quantity, max_quantity, delivery_estimate,
            has_warranty, is_popular, required_fields
     FROM categories
     WHERE is_active = 1 AND (display_name LIKE ? OR platform LIKE ? OR service_type LIKE ? OR description LIKE ?)
     ORDER BY is_popular DESC, sort_order LIMIT 50`
  ).bind(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`).all();

  return c.json(result.results || []);
});

// GET /api/categories/:platform — 取得特定平台的服務類型 (backward compatible)
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

// GET /api/categories/:platform/:serviceType — 取得品質方案列表 (backward compatible)
categoriesRoute.get('/:platform/:serviceType', async (c) => {
  const { platform, serviceType } = c.req.param();
  const db = c.env.DB;

  const cacheKey = `categories:${platform}:${serviceType}`;
  const cached = await c.env.CACHE.get(cacheKey, 'json');
  if (cached) return c.json(cached);

  const result = await db.prepare(
    `SELECT id, platform, service_type, quality, region, display_name, description,
            base_price_twd, min_quantity, max_quantity, delivery_estimate,
            has_warranty, is_popular, required_fields
     FROM categories
     WHERE platform = ? AND service_type = ? AND is_active = 1
     ORDER BY sort_order, quality`
  ).bind(platform, serviceType).all();

  const categories = result.results || [];
  await c.env.CACHE.put(cacheKey, JSON.stringify(categories), { expirationTtl: 300 });

  return c.json(categories);
});
