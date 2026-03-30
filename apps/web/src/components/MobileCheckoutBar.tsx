'use client';

import { useEffect, useState } from 'react';
import { getCart, getCartTotal, formatPrice, type CartItem } from '@/lib/cart';

interface MobileCheckoutBarProps {
  refreshKey?: number;
}

export default function MobileCheckoutBar({ refreshKey }: MobileCheckoutBarProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, [refreshKey]);

  if (cart.length === 0) return null;

  const total = getCartTotal(cart);
  const itemCount = cart.length;
  const summary = cart.length === 1
    ? `${cart[0].service.platform} ${cart[0].quantity.toLocaleString()} 個`
    : `${itemCount} 項服務`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 py-3 safe-area-bottom">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 truncate">已選：{summary}</p>
            <p className="text-lg font-bold text-primary-600">{formatPrice(total)}</p>
          </div>
          <a
            href="/checkout/"
            className="shrink-0 bg-primary-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-primary-700 transition-all shadow-lg text-sm"
          >
            立即購買
          </a>
        </div>
      </div>
    </div>
  );
}
