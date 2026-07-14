'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, FilePlus, Users, BookOpen, LogOut, ChevronLeft, ChevronRight, Settings, Activity, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

import { Suspense } from 'react';

interface AppSidebarProps {
  userRole: string;
  userName: string;
  collapsed: boolean;
  onToggle: () => void;
}

function SidebarNavigation({ collapsed, userRole }: { collapsed: boolean, userRole: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const navItems = [
    { name: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'New Prescription', href: '/doctor/prescription', icon: FilePlus },
    { name: 'Patients', href: '/doctor/patients', icon: Users },
    { name: 'Templates', href: '/doctor/prescription?tab=templates', icon: BookOpen },
    { name: 'Analytics', href: '/doctor/analytics', icon: Activity },
    { name: 'WhatsApp Setup', href: '/doctor/settings/whatsapp', icon: Smartphone },
  ];

  if (userRole === 'clinic_admin' || userRole === 'super_admin') {
    navItems.push({ name: 'Team Management', href: '/admin/team', icon: Users });
    navItems.push({ name: 'Clinic Settings', href: '/admin/settings', icon: Settings });
    navItems.push({ name: 'Clinic Drugs', href: '/admin/drugs', icon: FilePlus });
  }

  return (
    <>
      {navItems.map((item) => {
        const hrefPath = item.href.split('?')[0];
        const hrefQuery = item.href.includes('?') ? item.href.split('?')[1] : '';
        
        let isActive = false;
        
        if (pathname === hrefPath) {
          if (hrefQuery === 'tab=templates') {
            isActive = tab === 'templates';
          } else if (hrefPath === '/doctor/prescription') {
            isActive = tab !== 'templates';
          } else {
            isActive = true;
          }
        } else if (pathname.startsWith(hrefPath) && hrefPath !== '/doctor/dashboard') {
          isActive = true;
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 py-3 transition-all duration-200 group relative",
              isActive && !collapsed 
                ? "bg-clinic-blue text-white shadow-md pr-8 pl-6" 
                : isActive && collapsed 
                ? "bg-clinic-blue text-white rounded-lg mx-3 px-3 justify-center"
                : collapsed
                ? "text-slate-600 hover:bg-blue-100/50 hover:text-clinic-blue mx-3 px-3 rounded-lg justify-center transition-colors"
                : "text-slate-600 hover:bg-blue-100/50 hover:text-clinic-blue mx-3 px-3 rounded-lg transition-colors"
            )}
            style={isActive && !collapsed ? { clipPath: 'polygon(0% 0%, 100% 0%, calc(100% - 16px) 50%, 100% 100%, 0% 100%)' } : {}}
          >
            <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-clinic-navy")} />
            
            {!collapsed && (
              <span className="font-medium whitespace-nowrap">{item.name}</span>
            )}
            
            {collapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </Link>
        );
      })}
    </>
  );
}

export default function AppSidebar({ userRole, userName, collapsed, onToggle }: AppSidebarProps) {
  const { signOut } = useAuth();



  return (
    <div className={cn(
      "flex flex-col h-full bg-gradient-to-b from-indigo-50/80 to-white text-slate-900 transition-all duration-300 ease-in-out border-r border-indigo-100 shadow-sm relative",
      collapsed ? "w-[72px]" : "w-[256px]"
    )}>
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center px-4 mt-2 mb-2">
        {collapsed ? (
          <div className="flex items-center justify-center w-full">
            <Image src="/Logo.png" alt="RxNXT" width={36} height={36} className="object-contain" priority />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <Image src="/Logo.png" alt="RxNXT Logo" width={100} height={40} className="object-contain" priority />
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-white border border-indigo-200 rounded-full p-1 text-slate-400 hover:text-clinic-navy hover:bg-indigo-50 shadow-sm transition-colors hidden md:block z-10"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-2">
        <Suspense fallback={<div className="p-4 text-center text-slate-500 text-sm">Loading...</div>}>
          <SidebarNavigation collapsed={collapsed} userRole={userRole} />
        </Suspense>
      </nav>

      {/* User Area */}
      <div className="p-4 border-t border-indigo-100 bg-white/50 mt-auto">
        <div className={cn("flex items-center gap-3 mb-4", collapsed && "justify-center")}>
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-clinic-blue to-clinic-emerald flex items-center justify-center text-white text-sm font-bold shadow-inner shrink-0">
            {userName?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
              <p className="text-xs text-slate-500 capitalize truncate">{userRole.replace('_', ' ')}</p>
            </div>
          )}
        </div>
        
        <button
          onClick={signOut}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group mt-2",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
