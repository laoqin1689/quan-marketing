'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCart, type CartItem } from '@/lib/cart';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCart = () => setCartCount(getCart().length);
    updateCart();
    // Listen for cart updates
    const interval = setInterval(updateCart, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            <span className="text-xl font-bold text-gray-900">全行銷</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#platforms" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              服務目錄
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              使用方式
            </Link>
            <Link href="/#faq" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              常見問題
            </Link>
            <Link
              href="/order-status/"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              訂單查詢
            </Link>
            {cartCount > 0 && (
              <Link
                href="/checkout/"
                className="relative btn-primary text-sm !py-2 !px-4"
              >
                購物車
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </Link>
            )}
          </div>

          {/* Mobile toggle + cart */}
          <div className="md:hidden flex items-center gap-2">
            {cartCount > 0 && (
              <Link href="/checkout/" className="relative p-2 text-primary-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          <Link href="/#platforms" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600">
            服務目錄
          </Link>
          <Link href="/#how-it-works" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600">
            使用方式
          </Link>
          <Link href="/#faq" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600">
            常見問題
          </Link>
          <Link href="/order-status/" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-medium text-gray-700 hover:text-primary-600">
            訂單查詢
          </Link>
        </div>
      )}
    </nav>
  );
}
