'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/config';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      // Fetch products for instant search
      fetch('/api/products')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAllProducts(data);
          }
        })
        .catch((e) => console.error(e));
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const q = query.toLowerCase();
    const filtered = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.materials && p.materials.toLowerCase().includes(q)) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 6));
    setLoading(false);
  }, [query, allProducts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-craft-950/60 backdrop-blur-md transition-all">
      <div
        className="w-full max-w-2xl bg-cream border border-craft-200 rounded-2xl shadow-floating overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-craft-200">
          <Search className="w-5 h-5 text-gold shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by craft name, category, materials (e.g. resin, macrame)..."
            className="w-full bg-transparent text-craft-900 placeholder:text-stone-400 focus:outline-none text-base font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-stone-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-wider font-semibold px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-600 transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {query.trim() === '' ? (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-craft-500 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Popular Craft Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Resin Flower',
                  'Personalized Name Plaque',
                  'Macramé Wall Hanging',
                  'Gilded Coasters',
                  'Clay Vase',
                  'Terrazzo Candle Holder',
                ].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-sand/70 hover:bg-craft-200 text-craft-800 border border-craft-200 transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-craft-500 font-semibold mb-2">
                Found {results.length} result{results.length > 1 ? 's' : ''}
              </p>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-sand/60 transition-colors group border border-transparent hover:border-craft-200"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                    <Image
                      src={product.mainImage}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] uppercase tracking-wider text-craft-600 font-semibold block">
                      {product.category}
                    </span>
                    <h4 className="text-sm font-medium text-craft-900 truncate group-hover:text-gold-dark transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-craft-900">
                        {formatPrice(product.salePrice ?? product.price)}
                      </span>
                      {product.salePrice && (
                        <span className="text-[11px] text-stone-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-craft-800 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-stone-500 text-sm">
                We couldn&apos;t find any pieces matching &quot;{query}&quot;
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Try searching for resin, wood, pottery, or candle holder.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
