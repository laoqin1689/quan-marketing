'use client';

import type { ServiceItem } from '@/lib/api';

// Extra data for dynamic form fields per service type
export interface CartItemExtraData {
  comments?: string;    // newline-separated comments for Comments/Reviews/Posts
  rating?: number;      // 1-5 star rating for Reviews
  answer_number?: number; // poll option number for Votes
  usernames?: string;   // newline-separated usernames for Mentions
  keywords?: string;    // newline-separated keywords for SEO
  country?: string;     // country code for targeted services
}

export interface CartItem {
  service: ServiceItem;
  quantity: number;
  link: string;
  extraData?: CartItemExtraData;
}

const CART_KEY = 'qm_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCartStorage(item: CartItem): CartItem[] {
  const cart = getCart();
  const idx = cart.findIndex(c => c.service.id === item.service.id);
  if (idx >= 0) {
    cart[idx] = item;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  return cart;
}

export function removeFromCartStorage(serviceId: number): CartItem[] {
  const cart = getCart().filter(c => c.service.id !== serviceId);
  saveCart(cart);
  return cart;
}

export function clearCartStorage(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CART_KEY);
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => {
    return sum + Math.round((item.service.base_price_twd / 1000) * item.quantity * 100) / 100;
  }, 0);
}

export function formatPrice(amount: number): string {
  if (amount < 1 && amount > 0) return `NT$${amount.toFixed(2)}`;
  return `NT$${Math.round(amount).toLocaleString()}`;
}

export function formatPricePer1k(price: number): string {
  if (price < 1) return `NT$${price.toFixed(2)}`;
  return `NT$${Math.round(price).toLocaleString()}`;
}

export function calcUnitPrice(basePriceTwd: number): number {
  return basePriceTwd / 1000;
}

export function calcTotal(basePriceTwd: number, quantity: number): number {
  return Math.round((basePriceTwd / 1000) * quantity * 100) / 100;
}

// Parse required_fields from service item
export function parseRequiredFields(service: ServiceItem): string[] {
  try {
    return JSON.parse(service.required_fields || '["link","quantity"]');
  } catch {
    return ['link', 'quantity'];
  }
}
