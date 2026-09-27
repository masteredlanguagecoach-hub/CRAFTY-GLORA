'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, CustomizationOption, Product } from '@/types';
import { APP_CONFIG } from '@/lib/config';
import { useToast } from './ToastContext';

interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (
    product: Product,
    quantity?: number,
    customization?: CustomizationOption
  ) => void;
  removeFromCart: (productId: string, customizationKey?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    customizationKey?: string
  ) => void;
  clearCart: () => void;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'crafty_glora_cart_v1';
const COUPON_STORAGE_KEY = 'crafty_glora_coupon_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const { showToast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error('Failed to parse cart from localStorage', e);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save coupon to localStorage', e);
    }
  }, [appliedCoupon, isHydrated]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const getCustomizationHash = (customization?: CustomizationOption) => {
    if (!customization) return 'none';
    return JSON.stringify(customization);
  };

  const addToCart = (
    product: Product,
    quantity = 1,
    customization?: CustomizationOption
  ) => {
    const effectivePrice = product.salePrice ?? product.price;
    const customHash = getCustomizationHash(customization);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          getCustomizationHash(item.customization) === customHash
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > product.stockQuantity) {
          showToast(
            `Only ${product.stockQuantity} items in stock for ${product.name}`,
            'error'
          );
          return prevItems;
        }
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        if (quantity > product.stockQuantity) {
          showToast(`Only ${product.stockQuantity} items available`, 'error');
          return prevItems;
        }
        return [
          ...prevItems,
          {
            product,
            quantity,
            customization,
            selectedPrice: effectivePrice,
          },
        ];
      }
    });

    showToast(`Added "${product.name}" to cart`, 'success');
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, customizationHash?: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => {
        if (item.product.id !== productId) return true;
        if (customizationHash !== undefined) {
          return getCustomizationHash(item.customization) !== customizationHash;
        }
        return false;
      })
    );
    showToast('Item removed from cart', 'info');
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    customizationHash?: string
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, customizationHash);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        const matchesProduct = item.product.id === productId;
        const matchesCustom =
          customizationHash === undefined ||
          getCustomizationHash(item.customization) === customizationHash;

        if (matchesProduct && matchesCustom) {
          if (quantity > item.product.stockQuantity) {
            showToast(
              `Maximum available quantity is ${item.product.stockQuantity}`,
              'error'
            );
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  // Calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.selectedPrice * item.quantity,
    0
  );

  // Recalculate coupon discount against dynamic subtotal
  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round(
        (subtotal * appliedCoupon.discountValue) / 100
      );
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const eligibleForFreeShipping = subtotal >= APP_CONFIG.freeShippingThreshold;
  const shippingFee =
    subtotal === 0 || eligibleForFreeShipping ? 0 : APP_CONFIG.standardShippingFee;

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(
    (taxableAmount * APP_CONFIG.taxRatePercentage) / 100
  );
  const grandTotal = Math.max(0, taxableAmount + shippingFee + taxAmount);

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = async (
    code: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();

      if (data.valid && data.coupon) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          discountAmount: data.discountAmount,
        });
        showToast(data.message, 'success');
        return { success: true, message: data.message };
      } else {
        showToast(data.message || 'Invalid coupon', 'error');
        return { success: false, message: data.message || 'Invalid coupon' };
      }
    } catch {
      showToast('Error validating coupon', 'error');
      return { success: false, message: 'Network error validating coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        shippingFee,
        taxAmount,
        grandTotal,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
