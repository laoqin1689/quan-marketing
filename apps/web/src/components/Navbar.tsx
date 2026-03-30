'use client';

import Link from 'next/link';
import { useState } from 'react';

const platforms = [
  { name: 'Instagram', slug: 'Instagram', icon: '📸' },
  { name: 'Facebook', slug: 'Facebook', icon: '👍' },
  { name: 'YouTube', slug: 'YouTube', icon: '▶️' },
  { name: 'TikTok', slug: 'TikTok', icon: '🎵' },
  { name: 'Google', slug: 'Google', icon: '⭐' },
  { name: 'Threads', slug: 'Threads', icon: '🧵' },
  { name: 'LINE', slug: 'LINE', icon: '💬' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">全</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              全行銷
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {platforms.slice(0, 5).map((p) => (
              <Link
                key={p.slug}
                href={`/services/${p.slug}/`}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              >
                {p.icon} {p.name}
              </Link>
            ))}
            <div className="relative group">
              <button className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                更多 ▾
              </button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {platforms.slice(5).map((p) => (
                  <Link
                    key={p.slug}
                    href={`/services/${p.slug}/`}
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 first:rounded-t-xl last:rounded-b-xl"
                  >
                    {p.icon} {p.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Order lookup */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/order-status/" className="btn-secondary text-sm !py-2 !px-4">
              查詢訂單
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4">
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => (
                <Link
                  key={p.slug}
                  href={`/services/${p.slug}/`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-600"
                >
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link href="/order-status/" className="block text-center btn-secondary text-sm !py-2">
                查詢訂單
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
