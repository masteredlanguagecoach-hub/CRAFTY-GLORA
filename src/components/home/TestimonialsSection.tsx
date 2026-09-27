'use client';

import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { INITIAL_REVIEWS } from '@/lib/db/initialData';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-2">
          From Our Community
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-craft-950">
          Loved by Art Collectors & Gift Givers
        </h2>
        <p className="text-sm text-stone-600 mt-3 font-normal">
          Real words from patrons who have invited our handmade creations into their sanctuaries and celebrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {INITIAL_REVIEWS.slice(0, 3).map((review) => (
          <div
            key={review.id}
            className="p-8 rounded-3xl bg-cream border border-craft-200/90 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-gold">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-craft-300" />
              </div>

              <p className="font-serif italic text-craft-900 text-sm leading-relaxed mb-6">
                &quot;{review.review}&quot;
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-craft-200/60">
              <div>
                <h4 className="text-xs font-bold text-craft-950 uppercase tracking-wider">
                  {review.customerName}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-0.5">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified Patron</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
