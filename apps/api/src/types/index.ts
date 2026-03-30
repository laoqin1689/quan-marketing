// Cloudflare Workers Bindings
export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  ORDER_QUEUE: Queue;
  CAPI_QUEUE: Queue;
  ENVIRONMENT: string;
  N8N_WEBHOOK_BASE_URL: string;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
  PAYMENT_MERCHANT_ID: string;
  PAYMENT_HASH_KEY: string;
  PAYMENT_HASH_IV: string;
  META_PIXEL_ID: string;
  META_ACCESS_TOKEN: string;
}

// Database Models
export interface User {
  id: number;
  anonymous_id: string;
  email: string | null;
  phone: string | null;
  first_touch_utm: string | null;
  last_touch_utm: string | null;
  member_level: string;
  total_spent: number;
  order_count: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  platform: string;
  service_type: string;
  quality: string;
  region: string;
  display_name: string;
  description: string | null;
  base_price_twd: number;
  min_quantity: number;
  max_quantity: number;
  is_active: number;
  sort_order: number;
  created_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  api_url: string;
  api_key: string;
  is_active: number;
  health_status: string;
  last_health_check: string | null;
  avg_response_time_ms: number;
  success_rate: number;
  created_at: string;
}

export interface SupplierRoute {
  id: number;
  route_id: string;
  category_id: number;
  priority: number;
  supplier_id: number;
  supplier_service_id: string;
  cost_per_1k: number;
  score: number;
  has_refill: number;
  min_order: number;
  max_order: number;
  is_active: number;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: string;
  total_amount: number;
  currency: string;
  payment_method: string | null;
  social_account: string;
  social_platform: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  fbclid: string | null;
  gclid: string | null;
  ttclid: string | null;
  ref_code: string | null;
  coupon_code: string | null;
  discount_amount: number;
  supplier_id: number | null;
  supplier_order_id: string | null;
  supplier_status: string | null;
  fb_capi_sent: number;
  google_api_sent: number;
  tiktok_api_sent: number;
  created_at: string;
  paid_at: string | null;
  completed_at: string | null;
  anonymous_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  category_id: number;
  service_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  supplier_id: number | null;
  supplier_order_id: string | null;
  supplier_status: string;
  start_count: number | null;
  current_count: number | null;
  remains: number | null;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  utm_source: string | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: number;
  created_at: string;
}

export interface Affiliate {
  id: number;
  user_id: number;
  ref_code: string;
  commission_rate: number;
  l2_commission_rate: number;
  total_earnings: number;
  pending_balance: number;
  available_balance: number;
  parent_affiliate_id: number | null;
  created_at: string;
}

// API Request/Response Types
export interface CreateOrderRequest {
  social_account: string;
  social_platform: string;
  email: string;
  items: {
    category_id: number;
    quantity: number;
  }[];
  coupon_code?: string;
  ref_code?: string;
  // Tracking
  anonymous_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fbclid?: string;
  gclid?: string;
  ttclid?: string;
}

export interface OrderResponse {
  order_number: string;
  status: string;
  total_amount: number;
  payment_url?: string;
}

// N8N Webhook Payloads
export interface N8NOrderPayload {
  order_id: number;
  order_number: string;
  items: {
    item_id: number;
    category_id: number;
    service_name: string;
    quantity: number;
    route_id: string;
  }[];
  user_email: string;
  social_account: string;
  social_platform: string;
}

export interface N8NCAPIPayload {
  order_id: number;
  order_number: string;
  total_amount: number;
  currency: string;
  user_email: string;
  fbclid: string | null;
  gclid: string | null;
  ttclid: string | null;
  anonymous_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}
