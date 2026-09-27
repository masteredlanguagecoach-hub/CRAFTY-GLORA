'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Category, Product } from '@/types';
import { ProductCard } from '../product/ProductCard';
import { QuickViewModal } from '../product/QuickViewModal';

interface ShopClientProps {
  initialProducts: Product[];
  categories: Category[];
  initialCategorySlug?: string;
}

export const ShopClient: React.FC<ShopClientProps> = ({
  initialProducts,
  categories,
  initialCategorySlug,
}) => {
  const searchParams = useSearchParams();
  const filterQuery = searchParams.get('filter'); // e.g. 'new', 'bestseller'

  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategorySlug || 'all'
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyCustomizable, setOnlyCustomizable] = useState<boolean>(false);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState<boolean>(
    filterQuery === 'new'
  );
  const [onlyBestSellers, setOnlyBestSellers] = useState<boolean>(
    filterQuery === 'bestseller'
  );
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all') {
          const cat = categories.find((c) => c.slug === selectedCategory);
          const catName = cat ? cat.name : selectedCategory;
          if (p.category.toLowerCase() !== catName.toLowerCase()) return false;
        }

        // Price range
        const price = p.salePrice ?? p.price;
        if (selectedPriceRange === 'under-1000' && price >= 1000) return false;
        if (selectedPriceRange === '1000-2000' && (price < 1000 || price > 2000))
          return false;
        if (selectedPriceRange === '2000-3000' && (price < 2000 || price > 3000))
          return false;
        if (selectedPriceRange === 'above-3000' && price <= 3000) return false;

        // In Stock
        if (onlyInStock && p.stockQuantity === 0) return false;

        // Customizable
        if (onlyCustomizable && !p.isCustomizable) return false;

        // New Arrivals
        if (onlyNewArrivals && !p.isNewArrival) return false;

        // Best Sellers
        if (onlyBestSellers && !p.isBestSeller) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice ?? a.price;
        const priceB = b.salePrice ?? b.price;

        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest')
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [
    initialProducts,
    categories,
    selectedCategory,
    selectedPriceRange,
    onlyInStock,
    onlyCustomizable,
    onlyNewArrivals,
    onlyBestSellers,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setOnlyInStock(false);
    setOnlyCustomizable(false);
    setOnlyNewArrivals(false);
    setOnlyBestSellers(false);
    setSortBy('featured');
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-2">
          The Craft Atelier
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-craft-950">
          Handcrafted Catalogue
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 font-normal">
          Explore artisanal creations molded by human hands, preserved botanicals, and bespoke treasures.
        </p>
      </div>

      {/* Filter Bar Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-cream border border-craft-200 rounded-2xl mb-8 shadow-xs">
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sand text-xs font-semibold text-craft-900 border border-craft-300"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter & Refine</span>
          </button>

          <span className="text-xs text-stone-500 font-medium">
            Showing <strong className="text-craft-900">{filteredProducts.length}</strong> piece{filteredProducts.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-medium text-stone-500 hidden sm:inline">
            Sort by:
          </span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-craft-300 rounded-xl px-4 py-2 pr-9 text-xs font-semibold text-craft-900 focus:outline-none focus:border-gold cursor-pointer shadow-xs"
            >
              <option value="featured">Featured Curations</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <ChevronDown className="w-4 h-4 text-stone-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Products Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-8 p-6 bg-cream border border-craft-200 rounded-3xl h-fit shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-craft-200">
            <h3 className="font-serif text-lg font-semibold text-craft-950 flex items-center gap-2">
              <Filter className="w-4 h-4 text-gold" />
              <span>Filter By</span>
            </h3>
            <button
              onClick={resetFilters}
              className="text-[11px] text-stone-500 hover:text-craft-950 underline transition-colors"
            >
              Reset all
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2.5">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-craft-800">
              Collections
            </h4>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-sand font-bold text-craft-950'
                    : 'text-stone-600 hover:bg-sand/50'
                }`}
              >
                <span>All Collections</span>
                <span className="text-[10px] text-stone-400">({initialProducts.length})</span>
              </button>
              {categories.map((cat) => {
                const count = initialProducts.filter(
                  (p) => p.category.toLowerCase() === cat.name.toLowerCase()
                ).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-sand font-bold text-craft-950'
                        : 'text-stone-600 hover:bg-sand/50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-stone-400">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2.5 pt-4 border-t border-craft-200">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-craft-800">
              Price Range
            </h4>
            <div className="space-y-1.5 text-xs">
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under-1000', label: 'Under ₹1,000' },
                { id: '1000-2000', label: '₹1,000 — ₹2,000' },
                { id: '2000-3000', label: '₹2,000 — ₹3,000' },
                { id: 'above-3000', label: 'Above ₹3,000' },
              ].map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 cursor-pointer text-stone-600 hover:text-craft-950"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={selectedPriceRange === p.id}
                    onChange={() => setSelectedPriceRange(p.id)}
                    className="accent-gold cursor-pointer"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Attributes Filter */}
          <div className="space-y-2.5 pt-4 border-t border-craft-200">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-craft-800">
              Artisan Features
            </h4>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-stone-600 hover:text-craft-950">
                <input
                  type="checkbox"
                  checked={onlyCustomizable}
                  onChange={(e) => setOnlyCustomizable(e.target.checked)}
                  className="rounded border-craft-300 accent-gold"
                />
                <span>Customizable Keepsakes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-stone-600 hover:text-craft-950">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded border-craft-300 accent-gold"
                />
                <span>In Stock Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-stone-600 hover:text-craft-950">
                <input
                  type="checkbox"
                  checked={onlyNewArrivals}
                  onChange={(e) => setOnlyNewArrivals(e.target.checked)}
                  className="rounded border-craft-300 accent-gold"
                />
                <span>New Studio Creations</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-stone-600 hover:text-craft-950">
                <input
                  type="checkbox"
                  checked={onlyBestSellers}
                  onChange={(e) => setOnlyBestSellers(e.target.checked)}
                  className="rounded border-craft-300 accent-gold"
                />
                <span>Best Sellers</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Grid Area (3 cols) */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-cream rounded-3xl border border-craft-200 p-8">
              <Sparkles className="w-12 h-12 text-gold mx-auto mb-3" />
              <h3 className="font-serif text-xl font-medium text-craft-950 mb-2">
                We couldn&apos;t find that piece.
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-6">
                Try widening your price range or clearing attribute filters to reveal more handcrafted pieces.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-xl bg-craft-900 text-cream text-xs uppercase tracking-wider font-semibold hover:bg-craft-800 transition-colors shadow-soft"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
