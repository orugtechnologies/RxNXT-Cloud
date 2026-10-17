'use client';

import React from 'react';
import BillingDashboard from '@/components/billing/BillingDashboard';
import { ReceiptText } from 'lucide-react';

export default function AdminBillingPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pt-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
          <ReceiptText className="text-[#2563eb] mr-3" size={32} strokeWidth={2.5} />
          Clinic Billing & Invoices
        </h1>
        <p className="text-slate-500 mt-2 ml-11 text-sm font-medium">
          Comprehensive financial oversight. Review all patient invoices, track paid vs pending balances, and inspect payment receipts.
        </p>
      </div>

      <BillingDashboard />
    </div>
  );
}
