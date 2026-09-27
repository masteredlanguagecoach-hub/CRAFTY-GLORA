'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';
import { useToast } from '@/context/ToastContext';

export default function ContactPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSubmitting(true);
    // Simulate / call contact API
    setTimeout(() => {
      showToast('Your message has been sent to our atelier! We will respond within 24 hours.', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      });
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-1">
          Connect With The Atelier
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-craft-950">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 font-normal">
          Have a question regarding custom dimensions, bulk festive gifting, or care instructions? We are delighted to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Studio Contact Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-6">
            <h3 className="font-serif text-xl font-semibold text-craft-950 pb-3 border-b border-craft-200">
              Studio & Atelier Info
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sand text-gold shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-craft-950 block">Email Support</span>
                  <a href={`mailto:${APP_CONFIG.contactEmail}`} className="text-stone-600 hover:text-gold-dark">
                    {APP_CONFIG.contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sand text-gold shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-craft-950 block">Telephone</span>
                  <a href="tel:+919876543210" className="text-stone-600 hover:text-gold-dark">
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sand text-gold shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-craft-950 block">Studio Working Hours</span>
                  <p className="text-stone-600">Monday — Saturday: 10:00 AM – 7:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-sand text-gold shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-craft-950 block">Artisan Workshop</span>
                  <p className="text-stone-600 leading-relaxed">
                    Crafty Glora Artisan Studios, Bandra West, Mumbai, MH 400050, India
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Action */}
            <div className="pt-4 border-t border-craft-200">
              <a
                href={`https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(
                  'Hello Crafty Glora! I have an inquiry regarding a handcrafted custom piece.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Instant WhatsApp Concierge</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Contact Form (7 cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-5"
          >
            <h3 className="font-serif text-xl font-semibold text-craft-950 pb-3 border-b border-craft-200">
              Send an Artisan Inquiry
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Shalini Roy"
                  className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. shalini@example.com"
                  className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                  Subject
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Bespoke Customization">Bespoke Customization</option>
                  <option value="Bulk & Corporate Gifting">Bulk & Corporate Gifting</option>
                  <option value="Order Tracking & Status">Order Tracking & Status</option>
                  <option value="Artisan Partnership">Artisan Partnership</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-craft-800 mb-1">
                  Your Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist you with our handcrafted creations?..."
                  className="w-full px-4 py-2.5 text-xs bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-craft-900 hover:bg-craft-800 disabled:opacity-50 text-cream text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-soft hover:shadow-card transition-all"
            >
              {submitting ? (
                <span>Transmitting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-gold" />
                  <span>Send Message to Studio</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
