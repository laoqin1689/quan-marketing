import { Context, Next } from 'hono';
import type { Env } from '../types';

/**
 * Simple JWT-like admin authentication middleware.
 * For production, use proper JWT with hono/jwt.
 */
export async function adminAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');

  // Verify token from KV cache
  const session = await c.env.CACHE.get(`admin_session:${token}`);
  if (!session) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  await next();
}

/**
 * Generate a simple session token for admin login.
 */
export async function createAdminSession(env: Env, username: string): Promise<string> {
  const token = crypto.randomUUID();
  // Store session in KV with 24h TTL
  await env.CACHE.put(`admin_session:${token}`, JSON.stringify({ username, created: Date.now() }), {
    expirationTtl: 86400,
  });
  return token;
}
