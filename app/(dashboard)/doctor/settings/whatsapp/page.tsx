'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WhatsAppSettingsPage() {
  const [status, setStatus] = useState<string>('initializing');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Poll the microservice every 3 seconds to get the latest status and QR code
    const pollStatus = async () => {
      try {
        const response = await fetch('https://rxnxt-whatsapp-service.onrender.com/api/whatsapp/status');
        if (!response.ok) throw new Error('Microservice offline');
        
        const data = await response.json();
        setStatus(data.status);
        setQrCode(data.qr);
        setError(null);
      } catch (err) {
        setStatus('error');
        setError('Cannot connect to WhatsApp microservice. Please ensure it is running on port 3001.');
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">WhatsApp BYOD Integration</h2>
        <p className="text-slate-500">Connect your clinic's WhatsApp number to automatically send prescriptions and reminders.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-emerald-600" />
            Device Status
          </CardTitle>
          <CardDescription>
            Scan the QR code with your WhatsApp app (Linked Devices) to connect.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 min-h-[300px] border-t border-slate-100 bg-slate-50/50">
          
          {status === 'initializing' && (
            <div className="flex flex-col items-center gap-4 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p>Initializing WhatsApp Client...</p>
            </div>
          )}

          {status === 'waiting_for_scan' && qrCode && (
            <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Waiting for scan...</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Open WhatsApp on your phone, tap Menu or Settings and select <strong>Linked Devices</strong>. Point your phone to this screen to capture the code.
                </p>
              </div>
            </div>
          )}

          {status === 'connected' && (
            <div className="flex flex-col items-center gap-4 text-emerald-600 animate-in fade-in zoom-in duration-500">
              <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="font-bold text-xl text-slate-900">Successfully Connected</h3>
              <p className="text-emerald-700 font-medium">Your WhatsApp device is linked and ready to send messages!</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 text-red-600">
              <AlertCircle className="h-12 w-12" />
              <h3 className="font-bold text-lg">Microservice Offline</h3>
              <p className="text-red-500 text-center max-w-md">{error}</p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
