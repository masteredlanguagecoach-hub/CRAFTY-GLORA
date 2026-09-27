'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Category } from '@/types';

interface CategorySectionProps {
  categories: Category[];
}

export const CategorySection: React.FC<CategorySectionProps> = ({ categories }) => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-2">
            Curated Artisanal Realms
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-craft-950">
            Featured Collections
          </h2>
        </div>
        <p className="text-sm text-stone-600 max-w-md mt-4 md:mt-0 leading-relaxed font-normal">
          Every discipline represents countless hours of patient hand craftsmanship, natural raw material selection, and heartfelt dedication.
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.slice(0, 8).map((cat) => (
          <Link
            key={cat.id}
            href={`/shop/${cat.slug}`}
            className="group relative h-96 rounded-3xl overflow-hidden bg-sand/50 shadow-soft hover:shadow-floating transition-all duration-500 flex flex-col justify-end p-6 border border-craft-200/80 hover:-translate-y-2"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-craft-950/90 via-craft-950/40 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
            </div>

            {/* Content Details */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-gold-light font-semibold">
                  Handmade Craft
                </span>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-gold group-hover:text-craft-950 group-hover:rotate-45 transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <h3 className="font-serif text-2xl font-medium text-white group-hover:text-gold-light transition-colors">
                {cat.name}
              </h3>

              <p className="text-xs text-craft-200/90 line-clamp-2 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                {cat.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
