import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 bg-[url('/auth-bg.png')] bg-cover bg-center bg-no-repeat py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft gradient overlay for contrast and legibility */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px] z-0"></div>
      
      <div className="relative z-10 max-w-md w-full space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center mb-3">
            <Image src="/Logo.png" alt="RxNXT Logo" width={130} height={130} className="object-contain drop-shadow-md" priority />
          </div>
          <p className="text-sm font-bold text-slate-700 tracking-wide">
            Doctor Led. AI Enabled
          </p>
        </div>
        
        {children}
      </div>
    </div>
  );
}
