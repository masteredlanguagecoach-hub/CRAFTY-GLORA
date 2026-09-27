'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@craftyglora.com');
  const [password, setPassword] = useState('CraftyAdmin2026!#');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/dashboard');
      } else {
        setErrorMsg(data.error || 'Invalid credentials');
      }
    } catch {
      setErrorMsg('Network error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-craft-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-cream rounded-3xl p-8 sm:p-10 shadow-2xl border border-craft-800 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-craft-900 border border-craft-700 flex items-center justify-center mx-auto text-gold shadow-card">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-craft-600 block">
            Atelier Management
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-craft-950">
            Admin Authentication
          </h1>
          <p className="text-xs text-stone-500 font-normal">
            Sign in to manage orders, inventory, products, and Google Sheets synchronization.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-craft-800 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold pl-10"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-craft-800 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-craft-300 rounded-xl focus:outline-none focus:border-gold pl-10"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-craft-900 hover:bg-craft-800 disabled:opacity-50 text-cream uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-soft transition-all"
          >
            {loading ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>Enter Admin Portal</span>
                <ArrowRight className="w-4 h-4 text-gold" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Hint */}
        <div className="p-4 rounded-2xl bg-sand/60 border border-craft-200 text-xs text-craft-800 space-y-1">
          <p className="font-semibold text-craft-950 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Development Access</span>
          </p>
          <p className="text-[11px] text-stone-600">
            Email: <code className="bg-white px-1 py-0.5 rounded text-craft-950">admin@craftyglora.com</code>
          </p>
          <p className="text-[11px] text-stone-600">
            Password: <code className="bg-white px-1 py-0.5 rounded text-craft-950">CraftyAdmin2026!#</code>
          </p>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs text-craft-600 hover:text-craft-950 transition-colors"
          >
            ← Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
