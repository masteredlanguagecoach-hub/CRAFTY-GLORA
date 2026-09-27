'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { APP_CONFIG, formatPrice } from '@/lib/config';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount,
    grandTotal,
    totalItemsCount,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingThreshold = APP_CONFIG.freeShippingThreshold;
  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponCode);
    setCouponLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-craft-950/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-cream h-full shadow-2xl flex flex-col z-10 border-l border-craft-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-craft-200 flex items-center justify-between bg-craft-50">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-xl font-medium text-craft-900">
              Your Craft Cart
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sand text-craft-800 border border-craft-200">
              {totalItemsCount}
            </span>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-1.5 text-stone-400 hover:text-craft-900 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="bg-sand/60 px-6 py-3 border-b border-craft-200">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            {amountNeededForFreeShipping > 0 ? (
              <span className="text-craft-800">
                Add <strong className="text-gold-dark">{formatPrice(amountNeededForFreeShipping)}</strong> more for <strong>Free Shipping</strong>
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Unlocked Free Insured Shipping!
              </span>
            )}
            <span className="text-[11px] text-stone-500 font-bold">{progressToFreeShipping}%</span>
          </div>
          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-500 rounded-full"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-craft-200">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-sand/80 flex items-center justify-center text-craft-500 mb-4">
                <ShoppingBag className="w-8 h-8 stroke-1 text-gold" />
              </div>
              <h4 className="font-serif text-lg text-craft-900 mb-1">
                Your craft collection is waiting.
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mb-6">
                Discover pieces lovingly handmade by master artisans with natural materials.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="px-6 py-3 rounded-xl bg-craft-900 hover:bg-craft-800 text-cream text-xs uppercase tracking-wider font-semibold shadow-soft hover:shadow-floating transition-all flex items-center gap-2"
              >
                <span>Explore Crafts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.product.id}-${idx}`} className="py-4 flex gap-4">
                {/* Thumbnail */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-sand/50 shrink-0 border border-craft-200">
                  <Image
                    src={item.product.mainImage}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.product.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-craft-900 hover:text-gold-dark line-clamp-1 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-0.5"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Customization Details preview */}
                    {item.customization && (
                      <div className="mt-1 text-[11px] bg-sand/70 rounded-md p-1.5 text-craft-800 space-y-0.5 border border-craft-200/60">
                        {item.customization.recipientName && (
                          <p><strong className="text-craft-900">Name:</strong> {item.customization.recipientName}</p>
                        )}
                        {item.customization.customMessage && (
                          <p><strong className="text-craft-900">Message:</strong> {item.customization.customMessage}</p>
                        )}
                        {item.customization.colorPreference && (
                          <p><strong className="text-craft-900">Color:</strong> {item.customization.colorPreference}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-craft-300 rounded-lg bg-white overflow-hidden shadow-xs">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-semibold text-craft-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-craft-900">
                        {formatPrice(item.selectedPrice * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <div className="text-[10px] text-stone-400">
                          {formatPrice(item.selectedPrice)} each
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Area */}
        {items.length > 0 && (
          <div className="border-t border-craft-200 p-6 bg-craft-50/70 space-y-4">
            {/* Promo Code Input */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <div className="flex items-center gap-1.5 font-medium">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-{formatPrice(discountAmount)})</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-stone-400 hover:text-stone-600 p-1"
                  title="Remove coupon"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon code (e.g. WELCOME10)"
                  className="flex-1 px-3 py-2 text-xs border border-craft-300 rounded-lg bg-white focus:outline-none focus:border-gold uppercase font-medium"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2 bg-craft-800 hover:bg-craft-900 disabled:opacity-50 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </form>
            )}

            {/* Price Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-craft-900">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-medium text-craft-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold">FREE</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (5% GST)</span>
                <span className="font-medium text-craft-900">{formatPrice(taxAmount)}</span>
              </div>
              <div className="pt-2 border-t border-craft-200 flex justify-between text-sm font-bold text-craft-900">
                <span>Grand Total</span>
                <span className="text-base text-craft-950 font-serif">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-1">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3.5 px-4 bg-craft-900 hover:bg-craft-800 text-cream rounded-xl text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-soft hover:shadow-card transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified 256-bit Secure Razorpay Checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
