'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { APP_CONFIG, formatPrice } from '@/lib/config';

export default function CartPage() {
  const {
    items,
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

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const freeShippingThreshold = APP_CONFIG.freeShippingThreshold;
  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponInput);
    setCouponLoading(false);
  };

  if (items.length === 0) {
    return (
      <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-sand/80 flex items-center justify-center text-craft-500 mx-auto mb-6 shadow-soft">
          <ShoppingBag className="w-10 h-10 stroke-1 text-gold" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-craft-950 mb-2">
          Your craft collection is waiting.
        </h1>
        <p className="text-sm text-stone-500 max-w-sm mx-auto mb-8 font-normal">
          Explore handmade botanical arts, personalized plaques, and soulful pottery.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-craft-900 hover:bg-craft-800 text-cream text-xs uppercase tracking-widest font-semibold shadow-soft hover:shadow-card transition-all"
        >
          <span>Explore Handmade Crafts</span>
          <ArrowRight className="w-4 h-4 text-gold" />
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-1">
          Review Your Selection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-craft-950">
          Shopping Cart ({totalItemsCount})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Meter */}
          <div className="p-4 rounded-2xl bg-cream border border-craft-200">
            <div className="flex items-center justify-between text-xs mb-2 font-medium">
              {amountNeeded > 0 ? (
                <span className="text-craft-800">
                  Add <strong className="text-gold-dark">{formatPrice(amountNeeded)}</strong> more to receive <strong>Free Insured Shipping</strong>
                </span>
              ) : (
                <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-4 h-4 text-gold" />
                  Free Express Shipping Unlocked!
                </span>
              )}
              <span className="font-bold text-craft-900">{progressToFreeShipping}%</span>
            </div>
            <div className="w-full h-2 bg-sand rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items */}
          <div className="bg-cream rounded-3xl border border-craft-200 divide-y divide-craft-200/80 overflow-hidden shadow-xs">
            {items.map((item, idx) => (
              <div key={`${item.product.id}-${idx}`} className="p-6 flex flex-col sm:flex-row gap-6">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-sand/40 shrink-0 border border-craft-200">
                  <Image
                    src={item.product.mainImage}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-craft-600 block">
                          {item.product.category}
                        </span>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="font-serif text-base sm:text-lg font-medium text-craft-950 hover:text-gold-dark transition-colors"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Customization Details */}
                    {item.customization && (
                      <div className="mt-2 text-xs bg-sand/60 rounded-xl p-2.5 text-craft-800 space-y-1 border border-craft-200/70">
                        {item.customization.recipientName && (
                          <p><strong>Name:</strong> {item.customization.recipientName}</p>
                        )}
                        {item.customization.customMessage && (
                          <p><strong>Message:</strong> &quot;{item.customization.customMessage}&quot;</p>
                        )}
                        {item.customization.colorPreference && (
                          <p><strong>Color:</strong> {item.customization.colorPreference}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-craft-300 rounded-xl bg-white overflow-hidden shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 text-xs font-bold text-craft-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-2 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-lg font-bold text-craft-950">
                        {formatPrice(item.selectedPrice * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[11px] text-stone-400">
                          {formatPrice(item.selectedPrice)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-5">
            <h3 className="font-serif text-xl font-semibold text-craft-950 pb-3 border-b border-craft-200">
              Order Summary
            </h3>

            {/* Promo Code */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <div className="flex items-center gap-2 font-medium">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="COUPON (e.g. WELCOME10)"
                  className="flex-1 px-3 py-2.5 text-xs border border-craft-300 rounded-xl bg-white focus:outline-none focus:border-gold font-medium uppercase"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-4 py-2.5 bg-craft-900 hover:bg-craft-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </form>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-craft-900">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-craft-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700">FREE</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (5%)</span>
                <span className="font-semibold text-craft-900">{formatPrice(taxAmount)}</span>
              </div>
              <div className="pt-3 border-t border-craft-200 flex justify-between text-base font-bold text-craft-950">
                <span>Grand Total</span>
                <span className="font-serif text-xl">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <Link
              href="/checkout"
              className="w-full py-4 px-6 rounded-xl bg-craft-900 hover:bg-craft-800 text-cream text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-soft hover:shadow-card transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-gold" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Secure 256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
