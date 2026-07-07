'use client';

import { useRouter } from 'next/navigation';
import { PlusCircle, Search, History } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      name: 'New Prescription',
      icon: PlusCircle,
      desc: 'Create a new digital Rx',
      onClick: () => router.push('/doctor/prescription'),
      gradient: 'from-emerald-500 to-emerald-700',
    },
    {
      name: 'Search Patient',
      icon: Search,
      desc: 'Find existing records',
      onClick: () => router.push('/doctor/prescription?tab=patients'),
      gradient: 'from-blue-500 to-blue-700',
    },
    {
      name: 'View History',
      icon: History,
      desc: 'Recent encounters',
      onClick: () => router.push('#recent'),
      gradient: 'from-purple-500 to-purple-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={cn(
            "group relative overflow-hidden rounded-xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-md",
            "bg-gradient-to-br", action.gradient
          )}
        >
          {/* Decorative background circle */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 transition-transform group-hover:scale-150 duration-500" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">{action.name}</h3>
              <p className="text-white/80 text-sm font-medium">{action.desc}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
