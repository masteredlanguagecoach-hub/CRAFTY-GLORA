'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';
import { APP_CONFIG, formatPrice } from '@/lib/config';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-craft-900 text-craft-50 text-xs py-2 px-4 relative border-b border-craft-800 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2 text-gold">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="tracking-widest uppercase text-[10px] font-semibold">Artisan Handcrafted</span>
        </div>

        <div className="flex-1 text-center font-medium tracking-wide">
          <span>Complimentary gift box packaging on orders over {formatPrice(APP_CONFIG.freeShippingThreshold)}</span>
          <span className="mx-2 text-craft-400">•</span>
          <span className="text-gold-light">Use code <strong className="font-bold underline">WELCOME10</strong> for 10% off</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/track-order"
            className="hidden sm:inline-block text-craft-200 hover:text-white transition-colors text-[11px]"
          >
            Track Order
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            aria-label="Dismiss announcement"
            className="text-craft-400 hover:text-craft-100 transition-colors p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
