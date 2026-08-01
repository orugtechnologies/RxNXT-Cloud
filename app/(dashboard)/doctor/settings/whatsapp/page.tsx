'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Smartphone, CheckCircle2, AlertCircle, Download, Share2 } from 'lucide-react';

export default function WhatsAppSettingsPage() {
  const [status, setStatus] = useState<string>('initializing');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'RxNXT-WhatsApp-QR.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500 w-full max-w-lg">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
              </div>

              <button
                type="button"
                onClick={handleDownloadQR}
                className="bg-gradient-to-r from-[#2563eb] to-[#0ea5e9] hover:from-[#1d4ed8] hover:to-[#0284c7] text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <Download size={18} />
                <span>Save QR Code to Photo Gallery</span>
              </button>

              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Waiting for scan...</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  If using a PC/Laptop, open WhatsApp on your phone $\rightarrow$ <strong>Linked Devices</strong> $\rightarrow$ point your camera at this screen.
                </p>
                <div className="mt-4 p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium animate-pulse">
                  ⚠️ After scanning, please wait on this page (up to 30 seconds) until you see the green "Successfully Connected" screen.
                </div>
              </div>

              {/* Single Phone Helper Box */}
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-4 text-left w-full text-xs sm:text-sm text-slate-700 space-y-2">
                <div className="font-bold text-[#2563eb] flex items-center gap-1.5">
                  <span>📱</span>
                  <span>Using THIS exact smartphone to link? (Single-Device Mode)</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>Tap the <strong>Save QR Code to Photo Gallery</strong> button above (or take a screenshot).</li>
                  <li>Open your <strong>WhatsApp App</strong> on this phone $\rightarrow$ tap <strong>Menu (⋮) or Settings</strong> $\rightarrow$ <strong>Linked Devices</strong>.</li>
                  <li>Tap <strong>Link a Device</strong>. On the camera scanner screen, tap the <strong>Gallery / Photo icon</strong> at the top/bottom.</li>
                  <li>Select the QR code photo you just saved. Your clinic WhatsApp will connect instantly!</li>
                </ol>
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
