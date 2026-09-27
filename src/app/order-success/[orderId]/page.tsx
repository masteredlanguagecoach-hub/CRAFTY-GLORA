'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Truck,
  ArrowRight,
  ShoppingBag,
  MessageCircle,
  Calendar,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { Order } from '@/types';
import { APP_CONFIG, formatPrice } from '@/lib/config';

interface OrderSuccessProps {
  params: {
    orderId: string;
  };
}

export default function OrderSuccessPage({ params }: OrderSuccessProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C5A059', '#E8DAC6', '#8C583E', '#FAF7F2'],
      });
    } catch (e) {
      console.error(e);
    }

    // Fetch order details
    fetch(`/api/orders/${params.orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setOrder(data);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [params.orderId]);

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const formattedDeliveryDate = estimatedDelivery.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Success Badge */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-4 shadow-soft">
          <CheckCircle className="w-10 h-10 text-emerald-600 animate-in zoom-in-50 duration-300" />
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>Payment Verified & Order Confirmed</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-craft-950">
          Thank you for cherishing handmade art!
        </h1>
        <p className="text-sm text-stone-600 mt-2 font-normal">
          Your order has been transmitted to the Crafty Glora artisan studio.
        </p>
      </div>

      {/* Main Order Card */}
      <div className="p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-8">
        {/* Top Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-2xl bg-sand/40 border border-craft-200 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
              Order ID
            </span>
            <span className="font-mono font-bold text-craft-950 text-sm">
              {params.orderId}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
              Estimated Delivery
            </span>
            <span className="font-semibold text-craft-950 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              <span>{formattedDeliveryDate}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
              Amount Paid (Razorpay)
            </span>
            <span className="font-serif font-bold text-craft-950 text-base">
              {order ? formatPrice(order.grandTotal) : '...'}
            </span>
          </div>
        </div>

        {/* Purchased Items List */}
        {order?.items && order.items.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-craft-950 pb-2 border-b border-craft-200">
              Purchased Creations
            </h3>
            <div className="divide-y divide-craft-200/80">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center gap-4">
                  {item.image && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-sand/50 shrink-0 border border-craft-200">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-craft-950 truncate">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-stone-500">
                      Qty: {item.quantity} • {formatPrice(item.unitPrice)} each
                    </p>
                    {item.customization && (
                      <p className="text-[11px] text-gold-dark font-medium mt-0.5">
                        Customized: {JSON.stringify(item.customization)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-craft-950">
                    {formatPrice(item.finalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer & Shipping Summary */}
        {order && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-craft-200 text-xs">
            <div>
              <h4 className="font-serif text-sm font-semibold text-craft-950 mb-2">
                Shipping Destination
              </h4>
              <p className="font-semibold text-craft-900">{order.customerName}</p>
              <p className="text-stone-600">{order.shippingAddress.house}, {order.shippingAddress.street}</p>
              <p className="text-stone-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pin}
              </p>
              <p className="text-stone-600">Phone: {order.customerPhone}</p>
            </div>

            <div>
              <h4 className="font-serif text-sm font-semibold text-craft-950 mb-2">
                Status & Verification
              </h4>
              <p className="text-stone-600">
                Payment Status: <strong className="text-emerald-700">Verified & Paid</strong>
              </p>
              <p className="text-stone-600">
                Order Status: <strong className="text-craft-900">{order.orderStatus}</strong>
              </p>
              <p className="text-stone-600">
                Razorpay Payment ID: <span className="font-mono text-[11px]">{order.razorpayPaymentId || 'pay_demo_test'}</span>
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-6 border-t border-craft-200 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href={`/track-order?id=${params.orderId}`}
            className="w-full sm:w-auto flex-1 py-4 px-6 rounded-xl bg-craft-900 hover:bg-craft-800 text-cream text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-soft hover:shadow-card transition-all"
          >
            <Truck className="w-4 h-4 text-gold" />
            <span>Track Order Timeline</span>
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-4 rounded-xl border border-craft-300 hover:border-craft-900 text-craft-900 text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* WhatsApp Support CTA */}
        <div className="text-center pt-2">
          <a
            href={`https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(
              `Hello Crafty Glora! I just placed order #${params.orderId}. Can you please confirm the dispatch timeline?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Have a question about your order? Chat with our studio on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
