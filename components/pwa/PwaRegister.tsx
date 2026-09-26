'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, X, Share, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    // 2. Check if already running in standalone / installed PWA mode
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) {
      return; // Already installed and running as an app
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // 4. Listen for Chrome / Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const dismissed = sessionStorage.getItem('rxnxt_pwa_banner_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // On iOS, if not standalone and not dismissed, show the iOS installation guide banner after 1.5s
    if (isAppleDevice && !isRunningStandalone) {
      const dismissed = sessionStorage.getItem('rxnxt_pwa_banner_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Trigger native Chrome / Android install prompt
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted installation prompt');
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('rxnxt_pwa_banner_dismissed', 'true');
  };

  if (!showBanner || isStandalone) {
    return null;
  }

  return (
    <aside aria-label="Install App Banner" className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-bounce-in">
      <div className="bg-slate-900/95 border border-sky-500/40 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 relative">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white p-1.5 shrink-0 border border-slate-700 shadow-md">
            <Image src="/Logo.png" alt="RxNXT App Icon" width={36} height={36} className="object-contain" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Install RxNXT App</span>
              <span className="bg-sky-500/30 text-sky-300 text-[9px] font-bold px-1.5 py-0.2 rounded">PWA</span>
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              {isIOS
                ? 'Tap Share ➔ "Add to Home Screen"'
                : 'Fast fullscreen access on your device'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isIOS && deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-sky-900/40 active:scale-95 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          ) : isIOS ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg">
              <Share className="w-3 h-3" />
              <span>Share ➔ Add</span>
            </div>
          ) : (
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="text-xs font-bold text-sky-400 hover:underline px-2 py-1"
            >
              Add App
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
