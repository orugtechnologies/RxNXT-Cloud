'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import StatsCards from '@/components/dashboard/StatsCards';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentPrescriptions from '@/components/dashboard/RecentPrescriptions';
import UpcomingFollowUps from '@/components/dashboard/UpcomingFollowUps';
import FrequentMedicines from '@/components/dashboard/FrequentMedicines';
import { Loader2, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();
  const { profile, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (searchParams.get('login') === 'success') {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);


  const handleClone = (prescriptionId: string, patientId: string) => {
    // Navigate to prescription page with clone parameter
    router.push(`/doctor/prescription?clone=${prescriptionId}&patient=${patientId}`);
  };

  if (showFlash) {
    return (
      <div className="fixed inset-0 z-[100] bg-clinic-navy flex items-center justify-center p-4 animate-fade-in">
        <h1 className="text-white text-3xl md:text-5xl font-bold animate-pulse text-center max-w-4xl leading-tight">
          Hello Doctor, Welcome to another day of saving of Lives
        </h1>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="relative">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-clinic-emerald" />
            <p className="text-slate-500 font-medium animate-pulse">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-2xl mx-auto mt-10">
          <h3 className="text-lg font-bold mb-2">Error Loading Dashboard</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const doctorName = profile?.full_name || user?.email || 'Doctor';
  
  // Simple greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 relative">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            {greeting}, <span className="text-clinic-blue ml-2">{doctorName}</span>
            <InfoTooltip text="Welcome to your command center. View your daily queue, access recent patients, and quickly start new consultations." />
          </h2>
          <p className="text-slate-500 mt-1 font-medium">
            Here's your clinical overview for {formatDate(new Date().toISOString(), { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <StatsCards stats={data.stats} />
      
      <QuickActions />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentPrescriptions 
            prescriptions={data.recentPrescriptions} 
            onClone={handleClone} 
          />
        </div>
        <div className="space-y-6">
          <UpcomingFollowUps followUps={data.followUps} />
          <FrequentMedicines medicines={data.frequentMedicines} />
        </div>
      </div>
    </div>
  );
}
