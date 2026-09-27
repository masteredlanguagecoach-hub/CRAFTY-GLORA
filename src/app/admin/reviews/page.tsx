'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Review } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function AdminReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = () => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-1">
            Community Feedback & Praise
          </span>
          <h1 className="font-serif text-3xl font-semibold text-craft-950">
            Patron Reviews ({reviews.length})
          </h1>
        </div>

        <div className="bg-cream rounded-3xl border border-craft-200 overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-craft-200 bg-sand/40 text-stone-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-6">Patron</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Review Text</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-craft-200/60">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-sand/30 transition-colors">
                    <td className="py-4 px-6 font-bold text-craft-950">
                      {r.customerName}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex text-gold">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-gold" />
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-stone-700 italic max-w-md">
                      &quot;{r.review}&quot;
                    </td>

                    <td className="py-4 px-4 text-stone-500">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
