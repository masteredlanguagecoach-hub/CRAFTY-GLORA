'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { APP_CONFIG, formatPrice } from '@/lib/config';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount,
    grandTotal,
    appliedCoupon,
    clearCart,
  } = useCart();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    name: 'Priyanka Sen',
    email: 'priyanka.sen@example.com',
    phone: '9876543210',
    house: 'Flat 402, Lotus Orchid',
    street: 'Palm Beach Road, Sector 19',
    city: 'Navi Mumbai',
    district: 'Thane',
    state: 'Maharashtra',
    pin: '400706',
    country: 'India',
    deliveryInstructions: 'Fragile craft package. Please ring doorbell.',
    gstNumber: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.house || !formData.city || !formData.pin) {
      setErrorMessage('Please fill in all mandatory shipping address fields.');
      return;
    }

    setLoading(true);

    try {
      // 1. Call server to validate prices, stock, and create Razorpay Order
      const createRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            customization: i.customization,
          })),
          couponCode: appliedCoupon?.code,
          customerInfo: formData,
        }),
      });

      const orderData = await createRes.json();

      if (!createRes.ok || orderData.error) {
        setErrorMessage(orderData.error || 'Failed to initiate order. Please try again.');
        setLoading(false);
        return;
      }

      const { orderId, razorpayOrderId, amount, keyId, isMock, breakdown } = orderData;

      // 2. Open Razorpay Checkout or Sandbox Callback
      if (typeof window !== 'undefined' && window.Razorpay && !isMock) {
        const options = {
          key: keyId,
          amount: amount,
          currency: 'INR',
          name: APP_CONFIG.brandName,
          description: `Order #${orderId} Handcrafted Pieces`,
          order_id: razorpayOrderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#1F1D1B',
          },
          handler: async function (response: any) {
            await verifyAndCompleteOrder({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              customer: formData,
              items: items.map((i) => ({
                productId: i.product.id,
                quantity: i.quantity,
                customization: i.customization,
              })),
              breakdown,
              couponCode: appliedCoupon?.code,
            });
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              showToast('Payment window closed. Your cart is preserved.', 'info');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setLoading(false);
          router.push(`/order-failure?orderId=${orderId}&reason=${encodeURIComponent(resp.error.description || 'Payment Declined')}`);
        });
        rzp.open();
      } else {
        // Test / Sandbox Mode Fallback
        showToast('Sandbox mode: Completing verified payment simulation...', 'info');

        const mockPaymentId = `pay_mock_${Date.now().toString(36)}`;
        const mockSignature = `demo_sig_verified_${Date.now().toString(36)}`;

        await verifyAndCompleteOrder({
          orderId,
          razorpayOrderId: razorpayOrderId || `order_mock_${orderId}`,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
          customer: formData,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            customization: i.customization,
          })),
          breakdown,
          couponCode: appliedCoupon?.code,
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('A network or server error occurred during checkout.');
      setLoading(false);
    }
  };

  const verifyAndCompleteOrder = async (payload: any) => {
    try {
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        clearCart();
        router.push(`/order-success/${payload.orderId}`);
      } else {
        router.push(
          `/order-failure?orderId=${payload.orderId}&reason=${encodeURIComponent(
            verifyData.error || 'Payment signature verification failed'
          )}`
        );
      }
    } catch (err) {
      router.push(`/order-failure?orderId=${payload.orderId}&reason=VerificationNetworkError`);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <h2 className="font-serif text-2xl font-bold text-craft-950 mb-2">
          Your cart is currently empty.
        </h2>
        <Link
          href="/shop"
          className="text-xs uppercase font-semibold text-gold-dark hover:underline"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-1">
          Distraction-Free Checkout
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-craft-950">
          Delivery & Payment
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs text-stone-500 mt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>SSL 256-bit Encrypted Transaction</span>
        </div>
      </div>

      {errorMessage && (
        <div className="max-w-3xl mx-auto mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Shipping Form (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Customer Details Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-5">
              <h3 className="font-serif text-xl font-semibold text-craft-950 pb-3 border-b border-craft-200 flex items-center gap-2">
                <span>1. Contact & Customer Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                    Email Address (for order tracking) *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                    Mobile Number (for courier updates) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-5">
              <h3 className="font-serif text-xl font-semibold text-craft-950 pb-3 border-b border-craft-200">
                <span>2. Shipping Address</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                    House / Flat / Building No. *
                  </label>
                  <input
                    type="text"
                    name="house"
                    required
                    value={formData.house}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                    Street Address / Colony / Landmark *
                  </label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                    PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    name="pin"
                    required
                    maxLength={6}
                    value={formData.pin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={handleInputChange}
                    placeholder="e.g. Leave with security, fragile glass items"
                    className="w-full px-4 py-2 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                    GSTIN for Business Invoicing (Optional)
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Order Summary & Razorpay Trigger (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-6 sticky top-28">
              <h3 className="font-serif text-xl font-semibold text-craft-950 pb-3 border-b border-craft-200">
                Order Review ({items.length} item{items.length === 1 ? '' : 's'})
              </h3>

              {/* Items List preview */}
              <div className="max-h-60 overflow-y-auto divide-y divide-craft-200/70 pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-sand/50 shrink-0 border border-craft-200">
                      <Image
                        src={item.product.mainImage}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-craft-950 truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-[10px] text-stone-500 flex items-center gap-2">
                        <span>Qty: {item.quantity}</span>
                        {item.customization && (
                          <span className="text-gold-dark font-medium">• Customized</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-craft-950">
                      {formatPrice(item.selectedPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 pt-4 border-t border-craft-200 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-craft-900">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Insured Shipping</span>
                  <span className="font-semibold text-craft-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700">FREE</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (5% GST)</span>
                  <span className="font-semibold text-craft-900">{formatPrice(taxAmount)}</span>
                </div>
                <div className="pt-3 border-t border-craft-200 flex justify-between text-base font-bold text-craft-950">
                  <span>Total Payable</span>
                  <span className="font-serif text-2xl text-craft-950">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl bg-craft-900 hover:bg-craft-800 disabled:opacity-50 text-cream text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-soft hover:shadow-card transition-all"
              >
                {loading ? (
                  <span>Securing Payment...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-gold" />
                    <span>Pay {formatPrice(grandTotal)} via Razorpay</span>
                  </>
                )}
              </button>

              <div className="space-y-2 text-center text-[11px] text-stone-500">
                <p>Supports UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking.</p>
                <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified 256-bit Payment Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
