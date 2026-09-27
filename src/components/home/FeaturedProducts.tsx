'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '../product/ProductCard';
import { QuickViewModal } from '../product/QuickViewModal';

interface FeaturedProductsProps {
  products: Product[];
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'bestseller' | 'new' | 'custom'>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'bestseller') return p.isBestSeller;
    if (activeTab === 'new') return p.isNewArrival;
    if (activeTab === 'custom') return p.isCustomizable;
    return true;
  });

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-craft-200/60">
      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Handmade With Intention</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-craft-950">
            Artisan Signature Pieces
          </h2>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Pieces' },
            { id: 'bestseller', label: 'Best Sellers' },
            { id: 'new', label: 'New Arrivals' },
            { id: 'custom', label: 'Customizable' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-craft-900 text-cream shadow-soft'
                  : 'bg-cream text-stone-600 hover:text-craft-950 border border-craft-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid: 4 per row on desktop, 2-3 on tablet, 2 on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.slice(0, 8).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-14 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-craft-900 hover:bg-craft-800 text-cream text-xs uppercase tracking-widest font-semibold shadow-soft hover:shadow-card transition-all group"
        >
          <span>Explore Entire Catalogue</span>
          <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  );
};
