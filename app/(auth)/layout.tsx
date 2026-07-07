import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clinic-navy to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-clinic-emerald blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-clinic-blue blur-[100px]"></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center mb-4">
            <Image src="/Logo.png" alt="RxNXT Logo" width={120} height={120} className="object-contain drop-shadow-xl" priority />
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Digital Prescription & Clinic Management
          </p>
        </div>
        
        {children}
      </div>
    </div>
  );
}
