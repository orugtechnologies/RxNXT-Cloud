'use client';

import { DashboardStats } from '@/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserPlus, FileText, FilePlus, Calendar, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatsCards({ stats }: { stats: DashboardStats }) {
  if (!stats) return null;

  const cards = [
    {
      title: 'Total Patients',
      value: stats.total_patients || 0,
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-l-blue-500',
    },
    {
      title: "Today's Patients",
      value: stats.today_patients || 0,
      icon: UserPlus,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-l-emerald-500',
    },
    {
      title: 'Total Prescriptions',
      value: stats.total_prescriptions || 0,
      icon: FileText,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-l-purple-500',
    },
    {
      title: 'Prescriptions Today',
      value: stats.prescriptions_today || 0,
      icon: FilePlus,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-l-amber-500',
    },
    {
      title: 'Follow-Ups Due',
      value: stats.follow_ups_due || 0,
      icon: Calendar,
      color: 'bg-rose-500',
      lightColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      borderColor: 'border-l-rose-500',
      showBadge: (stats.follow_ups_due || 0) > 0,
    },
    {
      title: 'Recent Activity',
      value: (stats.recent_activity || []).length,
      icon: Activity,
      color: 'bg-teal-500',
      lightColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      borderColor: 'border-l-teal-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {cards.map((card, index) => (
        <Card 
          key={index} 
          className={cn(
            "border-l-[4px] border-y-0 border-r-0 shadow-sm hover:shadow-md transition-shadow duration-200 card-interactive",
            card.borderColor
          )}
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                {card.title}
                {card.showBadge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 animate-pulse-soft">
                    Action Needed
                  </span>
                )}
              </p>
              <h4 className="text-3xl font-bold text-slate-800">{card.value}</h4>
            </div>
            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0", card.lightColor, card.textColor)}>
              <card.icon className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
