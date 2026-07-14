'use client';

import React, { useState } from 'react';
import { Settings, Building2 } from 'lucide-react';
import ClinicProfileTab from '@/components/settings/ClinicProfileTab';

export default function ClinicSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Clinic Profile', icon: <Building2 size={18} /> },
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
        </div>
      </div>
    </div>
  );
}
