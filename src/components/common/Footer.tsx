'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Heart,
  Send,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';
import { useToast } from '@/context/ToastContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    showToast('Thank you for subscribing to Crafty Glora Stories!', 'success');
    setEmail('');
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-craft-950 text-craft-100 pt-16 pb-12 border-t border-craft-900">
      {/* Top Value Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-craft-800/80">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-craft-900 border border-craft-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">100% Handcrafted</h4>
              <p className="text-xs text-craft-300">Each piece handmade with artisan precision.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-craft-900 border border-craft-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Secure Razorpay Payments</h4>
              <p className="text-xs text-craft-300">UPI, Cards, NetBanking with 256-bit encryption.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-craft-900 border border-craft-800 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Artisanal Customization</h4>
              <p className="text-xs text-craft-300">Personalized inscriptions and custom notes.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-craft-900 border border-craft-800 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Safe & Insured Delivery</h4>
              <p className="text-xs text-craft-300">Eco-conscious protective gift packaging.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-3xl font-bold tracking-wider text-white">
                CRAFTY GLORA
              </span>
            </Link>
            <p className="text-sm text-craft-300 max-w-sm leading-relaxed">
              &quot;Made by Hand. Made to Matter.&quot; We are a premium artisan studio curating bespoke handmade crafts, preserved resin botanicals, ceramic treasures, and personalized keepsakes.
            </p>

            <div className="pt-2 flex flex-col space-y-2 text-xs text-craft-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold" />
                <span>{APP_CONFIG.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold" />
                <span>Artisan Studio, Bandra West, Mumbai, MH, India</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello Crafty Glora! I would like to enquire about your handcrafted collection.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with us on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h5 className="font-serif text-base font-semibold text-white mb-4 tracking-wide">
              Craft Collections
            </h5>
            <ul className="space-y-2.5 text-xs text-craft-300">
              <li>
                <Link href="/shop/resin-crafts" className="hover:text-gold transition-colors">
                  Resin Botanical Crafts
                </Link>
              </li>
              <li>
                <Link href="/shop/personalized-gifts" className="hover:text-gold transition-colors">
                  Personalized Name Plaques
                </Link>
              </li>
              <li>
                <Link href="/shop/wall-art" className="hover:text-gold transition-colors">
                  Macramé & Canvas Art
                </Link>
              </li>
              <li>
                <Link href="/shop/ceramic-pottery" className="hover:text-gold transition-colors">
                  Ceramic & Pottery
                </Link>
              </li>
              <li>
                <Link href="/shop/candle-holders" className="hover:text-gold transition-colors">
                  Terrazzo Candle Stands
                </Link>
              </li>
              <li>
                <Link href="/shop/handmade-jewellery" className="hover:text-gold transition-colors">
                  Polymer Clay Jewellery
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support & Policies */}
          <div>
            <h5 className="font-serif text-base font-semibold text-white mb-4 tracking-wide">
              Customer Care
            </h5>
            <ul className="space-y-2.5 text-xs text-craft-300">
              <li>
                <Link href="/track-order" className="hover:text-gold transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold transition-colors">
                  Our Artisan Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Contact & Studio Hours
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping" className="hover:text-gold transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="hover:text-gold transition-colors">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy" className="hover:text-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/terms" className="hover:text-gold transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h5 className="font-serif text-base font-semibold text-white mb-4 tracking-wide">
              Artisan Stories
            </h5>
            <p className="text-xs text-craft-300 leading-relaxed mb-4">
              Receive private invitations to seasonal collections, custom craft guides, and studio previews.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3.5 py-2.5 text-xs bg-craft-900 border border-craft-800 rounded-xl text-white placeholder:text-craft-400 focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-gold hover:bg-gold-light text-craft-950 font-semibold text-xs rounded-xl uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-craft-900 text-xs text-craft-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>© {currentYear} {APP_CONFIG.brandName}. All rights reserved. Handcrafted with reverence.</span>
        </div>

        <div className="flex items-center space-x-6 text-[11px]">
          <Link href="/admin/login" className="hover:text-gold transition-colors">
            Admin Portal
          </Link>
          <Link href="/policies/terms" className="hover:text-gold transition-colors">
            Terms
          </Link>
          <Link href="/policies/privacy" className="hover:text-gold transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
};
