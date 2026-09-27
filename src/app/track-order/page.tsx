'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  MessageCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { APP_CONFIG, formatPrice } from '@/lib/config';

const TIMELINE_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'Paid', label: 'Order Placed & Paid', description: 'Payment verified and transmitted to the atelier.' },
  { status: 'Processing', label: 'Artisan Crafting', description: 'Piece is being hand-formed, cured, or inscribed.' },
  { status: 'Packed', label: 'Gift Box Packed', description: 'Cushioned with eco-wrap and sealed in signature box.' },
  { status: 'Shipped', label: 'Dispatched via Courier', description: 'In transit with tracking number assigned.' },
  { status: 'Out for Delivery', label: 'Out for Delivery', description: 'Courier partner is arriving in your area today.' },
  { status: 'Delivered', label: 'Delivered to Patron', description: 'Safely delivered and welcomed to its new home.' },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [orderIdInput, setOrderIdInput] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id.trim())}`);
      const data = await res.json();
      if (res.ok && data && !data.error) {
        setOrder(data);
      } else {
        setOrder(null);
        setErrorMsg(data.error || 'No order found with this reference number.');
      }
    } catch {
      setOrder(null);
      setErrorMsg('Network error while searching for order.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchOrder(initialId);
    }
  }, [initialId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderIdInput);
  };

  const getStepStatus = (stepIndex: number, currentStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'Payment Pending',
      'Paid',
      'Processing',
      'Packed',
      'Shipped',
      'Out for Delivery',
      'Delivered',
    ];

    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepStatusIdx = statusOrder.indexOf(TIMELINE_STEPS[stepIndex].status);

    if (currentStatus === 'Cancelled' || currentStatus === 'Refunded') {
      return 'cancelled';
    }

    if (currentIdx > stepStatusIdx) return 'completed';
    if (currentIdx === stepStatusIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-1">
          Real-Time Dispatch Timeline
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-craft-950">
          Track Your Craft Order
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 font-normal">
          Enter your unique Crafty Glora Order ID (e.g. <code>CG-20260920-0042</code>) to view live progress.
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto mb-12">
        <div className="flex gap-2 p-1.5 bg-cream border border-craft-300 rounded-2xl shadow-soft">
          <input
            type="text"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value.toUpperCase())}
            placeholder="Enter Order ID (e.g. CG-20260920-0042)"
            className="flex-1 px-4 py-2.5 bg-transparent text-xs font-mono font-semibold text-craft-950 placeholder:font-sans placeholder:font-normal focus:outline-none uppercase"
          />
          <button
            type="submit"
            disabled={loading || !orderIdInput.trim()}
            className="px-6 py-2.5 bg-craft-900 hover:bg-craft-800 disabled:opacity-50 text-cream rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5"
          >
            {loading ? (
              <span>Searching...</span>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Track</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results / Error */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3 max-w-md mx-auto mb-8">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {order && (
        <div className="p-6 sm:p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-10 animate-in fade-in duration-300">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-craft-200 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                Order Reference
              </span>
              <h2 className="font-mono text-xl font-bold text-craft-950">
                {order.id}
              </h2>
              <span className="text-xs text-stone-500">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                Current Status
              </span>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-craft-900 text-gold-light shadow-xs">
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Visual Order Tracking Timeline */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-craft-950 mb-8">
              Fulfillment Journey
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-8 border-l-2 border-craft-200">
              {TIMELINE_STEPS.map((step, idx) => {
                const stepState = getStepStatus(idx, order.orderStatus);

                return (
                  <div key={idx} className="relative group">
                    {/* Circle Node on Timeline */}
                    <div
                      className={`absolute -left-[31px] sm:-left-[39px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        stepState === 'completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : stepState === 'current'
                          ? 'bg-gold border-gold text-craft-950 animate-pulse shadow-glow'
                          : 'bg-white border-craft-300 text-stone-300'
                      }`}
                    >
                      {stepState === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : stepState === 'current' ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Text Info */}
                    <div>
                      <h4
                        className={`text-sm font-semibold tracking-wide ${
                          stepState === 'completed' || stepState === 'current'
                            ? 'text-craft-950'
                            : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Purchased Items in this Order */}
          <div className="pt-6 border-t border-craft-200">
            <h3 className="font-serif text-lg font-semibold text-craft-950 mb-4">
              Items in this Package
            </h3>
            <div className="divide-y divide-craft-200/80">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center gap-4">
                  {item.image && (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-sand/50 shrink-0 border border-craft-200">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-craft-950 truncate">
                      {item.productName}
                    </h4>
                    <span className="text-xs text-stone-500">
                      Qty: {item.quantity} • {formatPrice(item.unitPrice)}
                    </span>
                    {item.customization && (
                      <p className="text-[11px] text-gold-dark font-medium">
                        Customized: {JSON.stringify(item.customization)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-bold text-craft-950">
                    {formatPrice(item.finalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Destination & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-2xl bg-sand/30 border border-craft-200 text-xs">
            <div>
              <h4 className="font-semibold text-craft-950 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold" />
                <span>Shipping Address</span>
              </h4>
              <p className="text-stone-700">{order.customerName}</p>
              <p className="text-stone-600">
                {order.shippingAddress.house}, {order.shippingAddress.street}
              </p>
              <p className="text-stone-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pin}
              </p>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-craft-950 mb-1">
                  Assistance with this Dispatch
                </h4>
                <p className="text-stone-600">
                  Our artisan team is here to assist with address updates or special timing.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                    `Hello Crafty Glora! I'm tracking order #${order.id}. Can you give me an update?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-800 font-semibold hover:underline"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Chat with Studio on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-stone-500">Loading tracking...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
