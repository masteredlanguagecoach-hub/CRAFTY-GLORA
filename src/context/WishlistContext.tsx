'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string, productName?: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_STORAGE_KEY = 'crafty_glora_wishlist_v1';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        setWishlistIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load wishlist from storage', e);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }, [wishlistIds, isHydrated]);

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = (productId: string, productName = 'Item') => {
    if (wishlistIds.includes(productId)) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      showToast(`Removed "${productName}" from wishlist`, 'info');
    } else {
      setWishlistIds((prev) => [...prev, productId]);
      showToast(`Saved "${productName}" to wishlist`, 'success');
    }
  };

  const clearWishlist = () => setWishlistIds([]);

  return (
    <WishlistContext.Provider
      value={{ wishlistIds, toggleWishlist, isInWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
