'use client';

import React, { useState } from 'react';
import {
  Settings,
  FileSpreadsheet,
  HardDrive,
  CreditCard,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { APP_CONFIG } from '@/lib/config';
import { useToast } from '@/context/ToastContext';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [testingSheets, setTestingSheets] = useState(false);
  const [sheetTestResult, setSheetTestResult] = useState<any>(null);

  const handleTestGoogleSheets = async () => {
    setTestingSheets(true);
    setSheetTestResult(null);
    try {
      const res = await fetch('/api/admin/sync-sheets', { method: 'POST' });
      const data = await res.json();
      setSheetTestResult(data);
      if (data.success) {
        showToast('Google Sheets connection verified!', 'success');
      } else {
        showToast(data.message || 'Sheets connection notice', 'info');
      }
    } catch {
      showToast('Error verifying connection', 'error');
    } finally {
      setTestingSheets(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-craft-600 block mb-1">
            System & External Integrations
          </span>
          <h1 className="font-serif text-3xl font-semibold text-craft-950">
            Settings & Database Connectivity
          </h1>
        </div>

        {/* 1. Google Sheets Integration Box */}
        <div className="p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-craft-950">
                  Google Sheets Primary Database
                </h3>
                <p className="text-xs text-stone-500">
                  10-Sheet Structured Architecture for Products, Orders, Customers, and Payments
                </p>
              </div>
            </div>

            <button
              onClick={handleTestGoogleSheets}
              disabled={testingSheets}
              className="px-4 py-2 bg-craft-900 hover:bg-craft-800 text-cream rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingSheets ? 'animate-spin' : ''}`} />
              <span>{testingSheets ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-sand/50 border border-craft-200 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-craft-900 block mb-1">Environment Variables Required:</span>
                <ul className="list-disc pl-4 text-stone-600 space-y-1 text-[11px] font-mono">
                  <li>GOOGLE_SHEET_ID</li>
                  <li>GOOGLE_SERVICE_ACCOUNT_EMAIL</li>
                  <li>GOOGLE_PRIVATE_KEY</li>
                </ul>
              </div>
              <div>
                <span className="font-bold text-craft-900 block mb-1">Auto-Schema Mapping:</span>
                <p className="text-stone-600 text-[11px]">
                  <code>PRODUCTS</code>, <code>CATEGORIES</code>, <code>ORDERS</code>, <code>ORDER_ITEMS</code>, <code>PAYMENTS</code>, <code>INVENTORY</code>, <code>CUSTOMERS</code>, <code>REVIEWS</code>, <code>COUPONS</code>, <code>SETTINGS</code>
                </p>
              </div>
            </div>

            {sheetTestResult && (
              <div
                className={`p-4 rounded-xl border mt-3 text-xs ${
                  sheetTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <p className="font-bold mb-1">Status: {sheetTestResult.status}</p>
                <p>{sheetTestResult.message}</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Razorpay Payment Gateway Box */}
        <div className="p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-craft-950">
                Razorpay Payment Gateway
              </h3>
              <p className="text-xs text-stone-500">
                UPI, Cards, NetBanking with Server-Side HMAC-SHA256 Signature Verification
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-sand/50 border border-craft-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-craft-900">Configured Key ID:</span>
              <span className="font-mono text-stone-600">
                {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_craftyglora_demo'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-craft-900">Security Mode:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Server-side Verification Enforced (Never Frontend)
              </span>
            </div>
          </div>
        </div>

        {/* 3. Brand Information Box */}
        <div className="p-8 rounded-3xl bg-cream border border-craft-200 shadow-soft space-y-6">
          <h3 className="font-serif text-xl font-semibold text-craft-950 pb-3 border-b border-craft-200">
            Brand & Atelier Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-craft-800 mb-1">Brand Name</label>
              <input
                type="text"
                disabled
                defaultValue={APP_CONFIG.brandName}
                className="w-full px-4 py-2.5 bg-sand/60 border border-craft-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-craft-800 mb-1">Currency Code</label>
              <input
                type="text"
                disabled
                defaultValue="INR (₹)"
                className="w-full px-4 py-2.5 bg-sand/60 border border-craft-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-craft-800 mb-1">Support WhatsApp</label>
              <input
                type="text"
                disabled
                defaultValue={`+${APP_CONFIG.whatsappNumber}`}
                className="w-full px-4 py-2.5 bg-sand/60 border border-craft-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-craft-800 mb-1">Support Email</label>
              <input
                type="text"
                disabled
                defaultValue={APP_CONFIG.contactEmail}
                className="w-full px-4 py-2.5 bg-sand/60 border border-craft-300 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
