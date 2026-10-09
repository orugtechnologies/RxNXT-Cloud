import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 bg-[url('/auth-bg.png')] bg-cover bg-center bg-no-repeat py-6 sm:py-10 px-3 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Brand emerald/teal ambient glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/85 via-white/75 to-teal-50/80 backdrop-blur-[3px] z-0 pointer-events-none"></div>
      
      {/* Radial soft glow spots */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto my-auto">
        {children}
      </div>
    </div>
  );
}
