'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function IntegrationsTab() {
  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#25D366] px-6 py-4 border-b border-[#20bd5a] flex items-center">
          <MessageCircle className="text-white mr-2" size={20} />
          <h2 className="text-lg font-bold text-white">WhatsApp & SMS (Twilio)</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6">
            Connect your Twilio account to enable automatic WhatsApp prescriptions and SMS reminders to patients.
          </p>
          
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Account SID</label>
              <input type="text" disabled value="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="w-full border border-gray-300 bg-gray-50 text-gray-500 rounded-md p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Auth Token</label>
              <input type="password" disabled value="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="w-full border border-gray-300 bg-gray-50 text-gray-500 rounded-md p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">WhatsApp Sender Number</label>
              <input type="text" disabled value="whatsapp:+14155238886" className="w-full border border-gray-300 bg-gray-50 text-gray-500 rounded-md p-2.5 text-sm" />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center text-sm font-bold text-emerald-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              Integration Active
            </div>
            <button className="px-4 py-2 bg-gray-100 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-200 transition-colors">
              Configure in .env
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
