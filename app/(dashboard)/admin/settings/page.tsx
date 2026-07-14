'use client';

import React, { useState } from 'react';
import { Settings, Building2, Link as LinkIcon, CreditCard, FlaskConical, ShieldCheck, Calculator } from 'lucide-react';
import ClinicProfileTab from '@/components/settings/ClinicProfileTab';
import { Card, CardContent } from '@/components/ui/card';

export default function ClinicSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Clinic Profile', icon: <Building2 size={18} /> },
    { id: 'integrations', label: 'Integrations', icon: <LinkIcon size={18} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-clinic-navy flex items-center">
          <Settings className="mr-3 text-clinic-emerald" size={28} />
          Clinic Settings
        </h1>
        <p className="text-gray-500 mt-1 ml-10">Manage your clinic preferences and configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Sidebar Tabs */}
        <div className="md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-bold rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-clinic-emerald/10 text-clinic-emerald'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`mr-3 ${activeTab === tab.id ? 'text-clinic-emerald' : 'text-gray-400'}`}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && <ClinicProfileTab />}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Integrations</h2>
                <p className="text-slate-500 text-sm mt-1">Connect RxNXT with external services to supercharge your clinic.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: <CreditCard className="h-6 w-6 text-indigo-500" />, title: 'Payments', desc: 'Razorpay / Stripe for patient billing via WhatsApp', color: 'indigo' },
                  { icon: <FlaskConical className="h-6 w-6 text-amber-500" />, title: 'Labs & Diagnostics', desc: 'Order tests and receive reports directly in patient records', color: 'amber' },
                  { icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />, title: 'Government Health Registries', desc: 'ABDM / ABHA Health ID integration', color: 'emerald' },
                  { icon: <Calculator className="h-6 w-6 text-blue-500" />, title: 'Accounting', desc: 'Sync clinic revenue to Tally or QuickBooks', color: 'blue' },
                ].map((item) => (
                  <Card key={item.title} className="border-dashed border-2 border-slate-200 bg-slate-50/50 opacity-75">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-xl bg-${item.color}-50 flex items-center justify-center shrink-0`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{item.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                        <span className="inline-block mt-2 text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Coming Soon</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
