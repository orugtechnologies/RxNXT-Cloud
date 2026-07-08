'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import StatsCards from '@/components/dashboard/StatsCards';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentPrescriptions from '@/components/dashboard/RecentPrescriptions';
import UpcomingFollowUps from '@/components/dashboard/UpcomingFollowUps';
import FrequentMedicines from '@/components/dashboard/FrequentMedicines';
import { Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();
  const { profile, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (searchParams.get('login') === 'success') {
      setShowFlash(true);
      const timer = setTimeout(() => {
        setShowFlash(false);
      }, 4000);
      
      // Clean up the URL without triggering a Next.js re-render
      window.history.replaceState(null, '', '/doctor/dashboard');
      
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleClone = (prescriptionId: string, patientId: string) => {
    // Navigate to prescription page with clone parameter
    router.push(`/doctor/prescription?clone=${prescriptionId}&patient=${patientId}`);
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-clinic-emerald" />
          <p className="text-slate-500 font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-2xl mx-auto mt-10">
        <h3 className="text-lg font-bold mb-2">Error Loading Dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  const doctorName = profile?.full_name || user?.email || 'Doctor';
  
  // Simple greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 relative">
      {/* Flash Message */}
      {showFlash && (
        <div className="fixed top-6 right-6 z-50 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-fade-in flex items-center gap-4 transition-all duration-300 transform scale-100 hover:scale-105 border border-emerald-400/50">
          <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm shadow-inner">
            <span className="text-2xl block" role="img" aria-label="stethoscope">🩺</span>
          </div>
          <div>
            <h4 className="font-bold text-lg leading-tight tracking-wide">Hello Doctor,</h4>
            <p className="text-sm text-emerald-50 font-medium tracking-wide mt-0.5">Welcome to another day of saving lives</p>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, <span className="text-clinic-blue">{doctorName}</span>
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
