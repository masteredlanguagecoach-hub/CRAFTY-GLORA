'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  ArrowRight,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
} from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/config';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const effectivePrice = product.salePrice ?? product.price;
  const gallery = [product.mainImage, ...(product.images || [])];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-craft-950/60 backdrop-blur-md">
      <div
        className="relative w-full max-w-3xl bg-cream border border-craft-200 rounded-3xl shadow-floating overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-stone-600 hover:text-craft-900 transition-colors z-20 shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Side */}
          <div className="p-6 bg-sand/30 flex flex-col justify-between">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-sand/50 border border-craft-200">
              <Image
                src={gallery[selectedImage] || product.mainImage}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {gallery.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === i ? 'border-gold scale-95' : 'border-craft-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt="thumbnail" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Side */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-craft-600">
                {product.category}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-craft-900 mt-1 mb-2">
                {product.name}
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-gold text-gold'
                          : 'fill-stone-200 text-stone-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-craft-800">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-xs text-stone-400">
                  ({product.reviewsCount} artisan reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-serif text-2xl font-bold text-craft-950">
                  {formatPrice(effectivePrice)}
                </span>
                {product.salePrice && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
                {product.discountPercentage && (
                  <span className="text-xs font-semibold text-gold-dark bg-gold/10 px-2 py-0.5 rounded-full">
                    Save {product.discountPercentage}%
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                {product.shortDescription}
              </p>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-semibold text-craft-900">Quantity</span>
                <div className="flex items-center border border-craft-300 rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-stone-100 text-stone-600 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-xs font-bold text-craft-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="p-2 hover:bg-stone-100 text-stone-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0}
                  className="flex-1 py-3 px-4 rounded-xl bg-craft-900 hover:bg-craft-800 disabled:opacity-40 text-cream text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-soft hover:shadow-card transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={() => toggleWishlist(product.id, product.name)}
                  className={`p-3 rounded-xl border transition-all ${
                    isFavorited
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'border-craft-300 hover:border-craft-900 text-stone-600 bg-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="w-full text-center py-2 text-xs font-semibold text-craft-700 hover:text-craft-950 flex items-center justify-center gap-1 transition-colors"
              >
                <span>View Full Details & Customization Options</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
