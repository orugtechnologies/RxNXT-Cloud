import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 bg-[url('/auth-bg.png')] bg-cover bg-center bg-no-repeat py-6 px-3 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Soft gradient overlay for contrast and legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50/80 via-white/60 to-emerald-50/70 backdrop-blur-[2px] z-0 pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto my-auto animate-fade-in">
        {children}
      </div>
    </div>
  );
}
