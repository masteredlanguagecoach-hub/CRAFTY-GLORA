'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, Star, Sparkles, Check, Heart } from 'lucide-react';
import { AssistantProductRecommendation } from '@/types/assistant';

interface ProductRecommendationCardProps {
  product: AssistantProductRecommendation;
  onAddToCart: (product: AssistantProductRecommendation) => void;
  onCustomize?: (product: AssistantProductRecommendation) => void;
  onViewDetails?: (product: AssistantProductRecommendation) => void;
}

export const ProductRecommendationCard: React.FC<ProductRecommendationCardProps> = ({
  product,
  onAddToCart,
  onCustomize,
  onViewDetails,
}) => {
  const effectivePrice = product.salePrice ?? product.price;
  const discountPercent =
    product.salePrice && product.salePrice < product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-craft-200/80 shadow-sm hover:shadow-md hover:border-gold-300 transition-all duration-300 overflow-hidden flex flex-col p-3.5 max-w-[280px] sm:max-w-[300px] flex-shrink-0">
      {/* Best Match / Badge */}
      {product.isBestMatch && (
        <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-gold-500 to-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Best Match
        </div>
      )}

      {/* Product Image */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-craft-50 mb-3 group-hover:scale-[1.02] transition-transform duration-300">
        <Image
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80'}
          alt={product.name}
          fill
          sizes="280px"
          className="object-cover"
        />
        {discountPercent > 0 && (
          <span className="absolute bottom-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-craft-500 mb-1">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-gold-700">
              {product.category}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500 font-medium">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating ?? 4.9}</span>
            </div>
          </div>

          {/* Title */}
          <h4 className="font-serif font-bold text-sm text-craft-900 line-clamp-1 group-hover:text-gold-700 transition-colors">
            {product.name}
          </h4>

          {/* Match Reason Tag */}
          {product.matchReason && (
            <p className="mt-1 text-[11px] text-emerald-700 bg-emerald-50/80 border border-emerald-100 rounded-lg px-2 py-0.5 line-clamp-1">
              ✨ {product.matchReason}
            </p>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-3 pt-2.5 border-t border-craft-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-bold text-base text-craft-900">
                ₹{effectivePrice.toLocaleString('en-IN')}
              </span>
              {product.salePrice && product.salePrice < product.price && (
                <span className="text-xs text-craft-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {product.isCustomizable && (
              <span className="text-[10px] text-gold-600 font-medium block">
                ✍️ Personalizable
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className="p-2 rounded-xl bg-craft-100 text-craft-700 hover:bg-gold-50 hover:text-gold-700 transition-colors"
              title="View Product Page"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={() => onAddToCart(product)}
              className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-gold-600 to-amber-600 hover:from-gold-700 hover:to-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
