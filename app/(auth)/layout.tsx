import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 bg-[url('/auth-bg.png')] bg-cover bg-center bg-no-repeat py-8 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Soft gradient overlay for contrast and legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-slate-100/70 backdrop-blur-[2px] z-0"></div>
      
      <div className="relative z-10 max-w-3xl w-full space-y-5 animate-fade-in my-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center mb-2">
            <Image src="/Logo.png" alt="RxNXT Logo" width={140} height={140} className="object-contain drop-shadow-md" priority />
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-700 tracking-wider uppercase">
            Doctor Led • AI Enabled • Indian OPD Platform
          </p>
        </div>
        
        {children}
      </div>
    </div>
  );
}
