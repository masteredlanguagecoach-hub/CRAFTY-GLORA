import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

interface PolicyProps {
  params: {
    slug: string;
  };
}

const POLICIES: Record<
  string,
  { title: string; subtitle: string; lastUpdated: string; content: string[] }
> = {
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How we respect and safeguard your personal details and custom inscriptions.',
    lastUpdated: 'September 2026',
    content: [
      'At Crafty Glora, we deeply respect your personal privacy. When you browse our handmade store, place an order, or submit customized inscriptions (such as names, messages, or reference images), your information is encrypted and treated with strict confidentiality.',
      'We collect only essential details required to fulfill your artisanal order, such as your full name, shipping address, contact phone number, and email for tracking notifications.',
      'We do not store complete credit card or debit card numbers on our servers. All financial transactions are securely processed via Razorpay with industry-standard 256-bit SSL encryption.',
      'Your personal details and customized family messages are never sold, rented, or distributed to third-party marketing brokers.',
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    subtitle: 'Guidelines governing the purchase and patronage of Crafty Glora pieces.',
    lastUpdated: 'September 2026',
    content: [
      'By accessing Crafty Glora and placing an order, you agree to these Terms and Conditions.',
      'Every product showcased on Crafty Glora is handmade by human artisans. Because we work with natural botanicals, reclaimed timbers, and hand-mixed epoxy resins, slight organic variations in petal placement, grain texture, and coloration are celebrated hallmarks of authenticity.',
      'Prices displayed are in Indian Rupees (INR) and are inclusive of statutory GST unless explicitly stated otherwise.',
      'Orders containing bespoke personalized inscriptions enter production once payment is verified and confirmed.',
    ],
  },
  shipping: {
    title: 'Shipping & Insured Delivery Policy',
    subtitle: 'Safe transit, eco-friendly gift packaging, and delivery timeframes across India.',
    lastUpdated: 'September 2026',
    content: [
      'Ready-to-ship handcrafted collections dispatch within 24 to 48 hours of confirmed payment.',
      'Customized and personalized pieces (such as custom name plaques and custom resin keepsakes) require 2–4 studio working days for hand crafting and curing before dispatch.',
      'We provide Free Insured Express Delivery on all orders above ₹999 across India. Orders below this threshold incur a flat nominal shipping fee of ₹99.',
      'All items are cushioned with multi-layer shock-absorbing honeycomb wrap, corner guards, and sealed in our signature gift box to prevent transit damage.',
      'Real-time courier tracking numbers are dispatched via SMS and Email upon pickup.',
    ],
  },
  returns: {
    title: 'Return & Replacement Policy',
    subtitle: 'Our 100% artisan satisfaction guarantee.',
    lastUpdated: 'September 2026',
    content: [
      'We take immense pride in the meticulous craftsmanship of every piece.',
      'In the rare event that an item reaches you in damaged condition during transit, please notify us within 48 hours of delivery with photos of the damaged item and packaging.',
      'Upon quick verification by our studio, we will dispatch a brand new replacement piece free of charge or initiate a full refund.',
      'Because customized keepsakes are permanently inscribed with personal names or dates, they cannot be returned for buyer change-of-mind, but remain fully covered against transit defects.',
    ],
  },
  cancellation: {
    title: 'Cancellation Policy',
    subtitle: 'Order modification and cancellation window.',
    lastUpdated: 'September 2026',
    content: [
      'Standard non-customized orders may be cancelled before they have been dispatched from our workshop by contacting customer support.',
      'For customized pieces, cancellation requests must be received within 6 hours of placement, before materials are laser-engraved or resin-poured.',
      'Refunds for eligible cancellations are credited back to the original payment method via Razorpay within 3–5 working days.',
    ],
  },
};

export async function generateMetadata({ params }: PolicyProps) {
  const policy = POLICIES[params.slug];
  if (!policy) return { title: 'Policy | Crafty Glora' };
  return {
    title: `${policy.title} | Crafty Glora`,
    description: policy.subtitle,
  };
}

export default function PolicyPage({ params }: PolicyProps) {
  const policy = POLICIES[params.slug];

  if (!policy) {
    notFound();
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-craft-700 hover:text-craft-950 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>

      <div className="space-y-3 pb-8 border-b border-craft-200">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600">
          Crafty Glora Guidelines
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-craft-950">
          {policy.title}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-normal">
          {policy.subtitle}
        </p>
        <span className="text-[11px] text-stone-400 block pt-1">
          Last Updated: {policy.lastUpdated}
        </span>
      </div>

      <div className="p-8 sm:p-10 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-6 text-sm text-stone-700 leading-relaxed">
        {policy.content.map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
