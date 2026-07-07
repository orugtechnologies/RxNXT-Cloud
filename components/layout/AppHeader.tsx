'use client';

import { usePathname } from 'next/navigation';
import { Menu, Bell } from 'lucide-react';
import { capitalize } from '@/lib/utils';

interface AppHeaderProps {
  userName: string;
  userRole: string;
  onMenuToggle: () => void;
}

export default function AppHeader({ userName, userRole, onMenuToggle }: AppHeaderProps) {
  const pathname = usePathname();
  
  // Determine page title based on route
  let pageTitle = 'Dashboard';
  if (pathname.includes('/prescription')) pageTitle = 'New Prescription';
  if (pathname.includes('/patients/')) pageTitle = 'Patient History';
  if (pathname.includes('/settings')) pageTitle = 'Settings';

  return (
    <header className="h-16 fixed top-0 right-0 left-0 md:left-auto bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <h1 className="text-xl font-bold text-slate-800">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-slate-700 leading-none mb-1">
              {userName}
            </p>
            <p className="text-xs text-clinic-emerald font-medium leading-none">
              {capitalize(userRole.replace('_', ' '))}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-clinic-blue to-clinic-emerald flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white">
            {userName?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
