'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/config';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const effectivePrice = product.salePrice ?? product.price;
  const secondImage = product.images?.[1] || product.mainImage;

  return (
    <div
      className="group relative bg-cream border border-craft-200/80 rounded-2xl overflow-hidden card-depth-hover flex flex-col transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-sand/30">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <Image
            src={isHovered && secondImage ? secondImage : product.mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {product.discountPercentage && product.discountPercentage > 0 ? (
            <span className="bg-craft-900 text-gold-light text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              {product.discountPercentage}% OFF
            </span>
          ) : null}

          {product.isNewArrival && (
            <span className="bg-gold text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              New
            </span>
          )}

          {product.isCustomizable && (
            <span className="bg-craft-100 text-craft-800 border border-craft-300 text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Customizable
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id, product.name);
          }}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10 ${
            isFavorited
              ? 'bg-red-50 text-red-500 shadow-md'
              : 'bg-white/90 text-stone-600 hover:text-red-500 hover:bg-white shadow-xs'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 text-stone-700 hover:text-craft-950 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hidden sm:flex items-center justify-center"
            title="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        {/* Stock Status Badge if Low or Out */}
        {product.stockQuantity === 0 ? (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="px-3 py-1 bg-craft-900 text-white text-xs font-semibold uppercase tracking-wider rounded-lg">
              Sold Out
            </span>
          </div>
        ) : product.stockQuantity <= product.lowStockThreshold ? (
          <span className="absolute bottom-3 left-3 bg-amber-100 text-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-amber-300">
            Only {product.stockQuantity} left
          </span>
        ) : null}
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="uppercase tracking-wider text-[10px] font-semibold text-craft-600">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-craft-800">
              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
              <span className="font-bold text-[11px]">{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-stone-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block group-hover:text-gold-dark transition-colors">
            <h3 className="font-serif text-sm sm:text-base font-medium text-craft-900 line-clamp-1 mb-1">
              {product.name}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-xs text-stone-500 line-clamp-1 mb-3">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Add to Cart button */}
        <div className="pt-2 border-t border-craft-200/60 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold text-craft-950 font-serif">
                {formatPrice(effectivePrice)}
              </span>
              {product.salePrice && (
                <span className="text-xs text-stone-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stockQuantity === 0}
            aria-label={`Add ${product.name} to cart`}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-craft-900 hover:bg-craft-800 disabled:opacity-40 text-cream text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5 shadow-xs hover:shadow-soft"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
