'use client';

import { usePathname } from 'next/navigation';
import { Menu, Bell, LogOut } from 'lucide-react';
import { capitalize, cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface AppHeaderProps {
  userName: string;
  userRole: string;
  collapsed?: boolean;
  onMenuToggle: () => void;
}

export default function AppHeader({ userName, userRole, collapsed = false, onMenuToggle }: AppHeaderProps) {
  const pathname = usePathname() || '';
  const { signOut } = useAuth();
  
  // Determine page title based on route
  let pageTitle = 'Dashboard';
  if (pathname.includes('/prescription')) pageTitle = 'New Prescription';
  else if (pathname.includes('/patients/')) pageTitle = 'Patient History';
  else if (pathname.includes('/settings')) pageTitle = 'Clinic Settings';
  else if (pathname.includes('/lab')) pageTitle = 'Diagnostic Laboratory';
  else if (pathname.includes('/pharmacist')) pageTitle = 'Pharmacy Counter';
  else if (pathname.includes('/receptionist')) pageTitle = 'Front Desk Reception';
  else if (pathname.includes('/nurse')) pageTitle = 'Nurse Dashboard';
  else if (pathname.includes('/admin/billing')) pageTitle = 'Billing & Invoices';
  else if (pathname.includes('/admin/team')) pageTitle = 'Manage Doctors';
  else if (pathname.includes('/admin/staff')) pageTitle = 'Support Staff';

  const safeRole = (userRole || 'doctor').replace(/_/g, ' ');
  const safeName = userName || 'User';

  return (
    <header className={cn(
      "h-16 fixed top-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300",
      collapsed ? "left-0 md:left-[72px]" : "left-0 md:left-[256px]"
    )}>
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <h1 className="text-xl font-bold text-slate-800">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors relative cursor-pointer" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-slate-700 leading-none mb-1">
              {safeName}
            </p>
            <p className="text-xs text-clinic-emerald font-medium leading-none">
              {capitalize(safeRole)}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-clinic-blue to-clinic-emerald flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white">
            {safeName?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>

        {/* Quick Header Sign Out fallback */}
        <button
          onClick={signOut}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
