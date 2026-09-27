'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, Star, Sparkles } from 'lucide-react';
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
    <div className="group relative bg-white rounded-2xl border border-craft-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all duration-300 overflow-hidden flex flex-col p-3.5 max-w-[280px] sm:max-w-[300px] flex-shrink-0">
      {/* Best Match / Badge */}
      {product.isBestMatch && (
        <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-200" /> Best Match
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
          <span className="absolute bottom-2 right-2 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-craft-500 mb-1">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-amber-800">
              {product.category}
            </span>
            <div className="flex items-center gap-0.5 text-amber-600 font-medium">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating ?? 4.9}</span>
            </div>
          </div>

          {/* Title */}
          <h4 className="font-serif font-bold text-sm text-craft-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
            {product.name}
          </h4>

          {/* Match Reason Tag */}
          {product.matchReason && (
            <p className="mt-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-0.5 line-clamp-1">
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
              <span className="text-[10px] text-amber-700 font-semibold block">
                ✍️ Personalizable
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className="p-2 rounded-xl bg-craft-100 text-craft-700 hover:bg-amber-100 hover:text-amber-900 transition-colors border border-craft-200"
              title="View Product Page"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-900 to-craft-950 hover:from-black hover:to-black text-white border border-amber-400/40 rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-white">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
