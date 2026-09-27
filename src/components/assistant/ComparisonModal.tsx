'use client';

import React from 'react';
import Image from 'next/image';
import { X, Sparkles, ShoppingBag } from 'lucide-react';
import { AssistantProductRecommendation } from '@/types/assistant';

interface ComparisonModalProps {
  products: AssistantProductRecommendation[];
  attributes?: { label: string; values: string[] }[];
  onClose: () => void;
  onSelectProduct: (product: AssistantProductRecommendation) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  products,
  attributes,
  onClose,
  onSelectProduct,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-craft-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-craft-100 bg-craft-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-craft-900">
                Side-by-Side Comparison
              </h3>
              <p className="text-xs text-craft-500">
                Compare craftsmanship, specifications & pricing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-craft-200/50 text-craft-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Products Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {products.map((p, idx) => (
              <div
                key={p.id || idx}
                className="flex flex-col items-center text-center p-3 rounded-2xl bg-craft-50/60 border border-craft-100"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden mb-2 bg-craft-200">
                  <Image
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80'}
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-serif font-bold text-xs text-craft-900 line-clamp-2 h-8">
                  {p.name}
                </h4>
                <p className="font-bold text-sm text-gold-700 mt-1">
                  ₹{(p.salePrice ?? p.price).toLocaleString('en-IN')}
                </p>
                <button
                  onClick={() => {
                    onSelectProduct(p);
                    onClose();
                  }}
                  className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-gold-600 hover:bg-gold-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  <ShoppingBag className="w-3 h-3" /> Select
                </button>
              </div>
            ))}
          </div>

          {/* Attributes Table */}
          {attributes && attributes.length > 0 && (
            <div className="border border-craft-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <tbody>
                  {attributes.map((attr, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? 'bg-craft-50/40' : 'bg-white'}
                    >
                      <td className="py-2.5 px-4 font-semibold text-craft-700 border-r border-craft-100 w-1/3">
                        {attr.label}
                      </td>
                      <td className="py-2.5 px-4 text-craft-900">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {attr.values.map((v, valIdx) => (
                            <span key={valIdx} className="line-clamp-2">
                              {v}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
