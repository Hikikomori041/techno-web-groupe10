'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cartApi } from '@/lib/cartApi';

export default function CartIcon() {
  const router = useRouter();
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      setLoading(true);
      const cart = await cartApi.getCart();
      setItemCount(cart.itemCount);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
      setItemCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Refresh cart count when window gains focus
  useEffect(() => {
    const handleFocus = () => fetchCartCount();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Listen for custom cart update events
  useEffect(() => {
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleClick = () => {
    router.push('/cart');
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
      title="Panier"
    >
      {/* Shopping Cart Icon */}
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>

      {/* Badge with item count */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}

