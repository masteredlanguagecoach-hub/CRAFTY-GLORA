'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, RefreshCw, ShoppingBag, MessageCircle } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';

function OrderFailureContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'Pending';
  const reason = searchParams.get('reason') || 'Transaction was declined or cancelled.';

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-6 shadow-soft">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>

      <span className="text-xs uppercase tracking-widest font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full mb-3 inline-block">
        Payment Not Completed
      </span>

      <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-craft-950 mb-3">
        Payment could not be completed.
      </h1>

      <p className="text-sm text-stone-600 mb-6 max-w-md mx-auto leading-relaxed font-normal">
        {reason}. Your cart contents have been safely preserved so you won&apos;t lose your selected artisan creations.
      </p>

      {orderId && (
        <div className="p-4 rounded-2xl bg-cream border border-craft-200 mb-8 max-w-md mx-auto text-xs text-stone-500">
          <span>Attempted Order Reference: </span>
          <strong className="font-mono text-craft-900">{orderId}</strong>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/checkout"
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-craft-900 hover:bg-craft-800 text-cream text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-soft hover:shadow-card transition-all"
        >
          <RefreshCw className="w-4 h-4 text-gold" />
          <span>Try Payment Again</span>
        </Link>

        <Link
          href="/cart"
          className="w-full sm:w-auto px-6 py-4 rounded-xl border border-craft-300 hover:border-craft-900 text-craft-900 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>
      </div>

      <div className="mt-10 pt-6 border-t border-craft-200">
        <a
          href={`https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(
            `Hello Crafty Glora! I experienced an issue completing my payment for order ${orderId}. Can you please assist?`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Need help? Contact Studio Support on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

export default function OrderFailurePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-stone-500">Loading...</div>}>
      <OrderFailureContent />
    </Suspense>
  );
}
