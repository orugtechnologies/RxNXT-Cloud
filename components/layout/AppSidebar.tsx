'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, FilePlus, Users, BookOpen, LogOut, ChevronLeft, ChevronRight, Settings, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

import { Suspense } from 'react';

const WhatsAppIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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

  let navGroups: { label: string, items: any[] }[] = [];

  if (userRole === 'receptionist') {
    navGroups = [
      {
        label: 'Overview',
        items: [
          { name: 'Dashboard', href: '/receptionist/dashboard', icon: LayoutDashboard },
        ]
      }
    ];
  } else if (userRole === 'nurse') {
    navGroups = [
      {
        label: 'Overview',
        items: [
          { name: 'Dashboard', href: '/nurse/dashboard', icon: LayoutDashboard },
        ]
      }
    ];
  } else {
    navGroups = [
      {
        label: 'Clinical',
        items: [
          { name: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
          { name: 'New Prescription', href: '/doctor/prescription', icon: FilePlus },
          { name: 'Patients', href: '/doctor/patients', icon: Users },
          { name: 'Templates', href: '/doctor/prescription?tab=templates', icon: BookOpen },
        ]
      },
      {
        label: 'Insights & Tools',
        items: [
          { name: 'Analytics', href: '/doctor/analytics', icon: Activity },
          { name: 'WhatsApp Setup', href: '/doctor/settings/whatsapp', icon: WhatsAppIcon },
        ]
      }
    ];

    if (userRole === 'clinic_admin' || userRole === 'super_admin') {
      navGroups.push({
        label: 'Administration',
        items: [
          { name: 'Manage Doctors', href: '/admin/team', icon: Users },
          { name: 'Support Staff', href: '/admin/staff', icon: Users },
          { name: 'Clinic Settings', href: '/admin/settings', icon: Settings },
          { name: 'Clinic Drugs', href: '/admin/drugs', icon: FilePlus },
        ]
      });
    }
  }

  return (
    <div className="space-y-6">
      {navGroups.map((group, groupIdx) => (
        <div key={groupIdx}>
          {!collapsed && (
            <h3 className="px-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {group.label}
            </h3>
          )}
          {collapsed && groupIdx > 0 && <div className="h-4" />}
          
          <div className="space-y-1">
            {group.items.map((item) => {
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
                    "flex items-center gap-3 py-2.5 transition-all duration-200 group relative",
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
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-clinic-blue")} />
                  
                  {!collapsed && (
                    <span className="font-medium whitespace-nowrap">{item.name}</span>
                  )}
                  
                  {collapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
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
