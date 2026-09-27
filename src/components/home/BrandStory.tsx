'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';

export const BrandStory: React.FC = () => {
  return (
    <section className="py-24 bg-sand/40 border-y border-craft-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Visual Images Grid (6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-card border border-craft-200">
              <Image
                src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000&auto=format&fit=crop"
                alt="Artisan ceramic shaping"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-4 pt-8">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-card border border-craft-200">
                <Image
                  src="https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?q=80&w=1000&auto=format&fit=crop"
                  alt="Macrame knotting detail"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 rounded-3xl bg-cream border border-craft-200 shadow-soft">
                <p className="font-serif italic text-sm text-craft-900 leading-snug">
                  &quot;In an era of mass machines, handmade art is a quiet act of devotion.&quot;
                </p>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-craft-600 block mt-2">
                  — The Crafty Glora Studio
                </span>
              </div>
            </div>
          </div>

          {/* Right Text Column (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-craft-600">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>The Crafty Glora Philosophy</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-craft-950 leading-[1.18]">
              Crafted With Hands. <br />
              <span className="italic font-normal text-craft-700">Created With Heart.</span>
            </h2>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
              At Crafty Glora, we believe that true luxury does not emerge from factory assembly lines. It is born in the patient quiet of the studio — in the delicate placement of wild daisies into pure resin, the deliberate knotting of natural cotton cords, and the mindful shaping of rich terracotta clay.
            </p>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
              Each piece carries the distinctive fingerprint of human creativity. Whether it is a personalized anniversary plaque or a hand-poured candle stand, our pieces are designed to become treasured heirlooms in your home.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/about"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-craft-900 hover:bg-craft-800 text-cream text-xs uppercase tracking-widest font-semibold shadow-soft hover:shadow-card transition-all flex items-center justify-center gap-2 group"
              >
                <span>Read Our Full Story</span>
                <ArrowRight className="w-4 h-4 text-gold group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-2 text-xs font-semibold text-craft-800">
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>Over 12,000 Happy Homes Enriched</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
