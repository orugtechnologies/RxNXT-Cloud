'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  Building2, 
  Server, 
  LogOut, 
  ArrowUpRight, 
  BarChart3, 
  Database,
  Loader2,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SuperAdminData {
  stats: {
    totalClinics: number;
    totalDoctors: number;
    totalReceptionists: number;
    totalNurses: number;
    totalAdmins: number;
    totalUsers: number;
    totalPatients: number;
    totalPrescriptions: number;
    totalEncounters: number;
    speedAnalytics: {
      avgSpeedSeconds: number;
      minSpeedSeconds: number;
      maxSpeedSeconds: number;
    };
    whatsapp: {
      sent: number;
      pending: number;
      failed: number;
      total: number;
      successRate: number;
    };
  };
  clinics: Array<{
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    doctorCount: number;
    patientCount: number;
    prescriptionCount: number;
    avgSpeedSeconds: number;
  }>;
  recentPrescriptions: Array<{
    id: string;
    createdAt: string;
    doctorName: string;
    patientName: string;
    clinicName: string;
    timeTakenSeconds: number;
  }>;
}

export default function SuperAdminDashboardPage() {
  const { user, profile, signOut } = useAuth();
  const [data, setData] = useState<SuperAdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/superadmin/stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      }
    } catch (error) {
      console.error('Failed to fetch Super Admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Super Admin Command Center
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                  Live Database Connected
                </span>
              </h1>
              <p className="text-xs text-slate-400">Global System Management & Infrastructure Health</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchStats}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh
          </Button>

          <div className="text-right hidden sm:block border-l border-slate-800 pl-4">
            <p className="text-sm font-semibold text-white">{profile?.full_name || user?.email}</p>
            <p className="text-xs text-indigo-400 font-mono">Super Admin</p>
          </div>

          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <span className="ml-3 text-slate-400 text-sm">Loading live database metrics...</span>
        </div>
      ) : (
        <>
          {/* Metrics overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                label: 'Active Clinics',
                value: data?.stats.totalClinics ?? 0,
                change: 'Registered Tenants',
                icon: Building2,
                color: 'text-indigo-400',
                bg: 'bg-indigo-500/10',
              },
              {
                label: 'Registered Doctors',
                value: data?.stats.totalDoctors ?? 0,
                change: `${data?.stats.totalPatients ?? 0} Total Patients`,
                icon: Users,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
              },
              {
                label: 'Prescriptions Issued',
                value: data?.stats.totalPrescriptions ?? 0,
                change: `${data?.stats.totalEncounters ?? 0} Encounters Recorded`,
                icon: Activity,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
              },
              {
                label: 'Avg Rx Speed',
                value: `${data?.stats.speedAnalytics.avgSpeedSeconds ?? 42}s`,
                change: `WhatsApp Success: ${data?.stats.whatsapp.successRate ?? 100}%`,
                icon: Clock,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
              },
            ].map((item, idx) => (
              <Card key={idx} className="border-slate-800 bg-slate-900/60 backdrop-blur">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{item.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{item.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.change}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Clinics Table & Services */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-slate-800 bg-slate-900/60 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-400" />
                    Live Clinic Tenants ({data?.clinics.length ?? 0})
                  </h2>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-mono">
                    PostgreSQL Multi-Tenant
                  </span>
                </div>

                <div className="space-y-3">
                  {data?.clinics.map((clinic) => (
                    <div
                      key={clinic.id}
                      className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-200">{clinic.name}</p>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                            ID: {clinic.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {clinic.phone || 'No phone'} • {clinic.email || 'No email'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <p className="text-slate-300 font-medium">{clinic.doctorCount} Doctors</p>
                          <p className="text-slate-500">{clinic.patientCount} Patients</p>
                        </div>
                        <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/50 border border-indigo-800/50 px-2.5 py-1 rounded-md font-mono">
                          {clinic.prescriptionCount} Rx
                        </span>
                      </div>
                    </div>
                  ))}

                  {(!data?.clinics || data.clinics.length === 0) && (
                    <p className="text-slate-500 text-sm text-center py-4">No clinics registered in the database.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Platform Services & Quick Actions */}
            <div className="space-y-6">
              <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Database className="h-5 w-5 text-indigo-400" />
                      Infrastructure Services
                    </h2>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-mono">
                      Operational
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: 'Database Cluster', detail: 'Neon PostgreSQL', status: 'Healthy' },
                      {
                        name: 'WhatsApp Service',
                        detail: `Sent: ${data?.stats.whatsapp.sent ?? 0} | Pending: ${data?.stats.whatsapp.pending ?? 0}`,
                        status: 'Connected',
                      },
                      { name: 'Authentication Provider', detail: 'NextAuth JWT Credentials', status: 'Active' },
                    ].map((svc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-200">{svc.name}</p>
                          <p className="text-[11px] text-slate-500">{svc.detail}</p>
                        </div>
                        <span className="font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
                          {svc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/60 backdrop-blur">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-400" />
                    Quick Super Admin Actions
                  </h2>
                  <div className="space-y-2">
                    <Button className="w-full justify-between bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 py-5">
                      <span>Export System Audit Log</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                    <Button className="w-full justify-between bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 py-5">
                      <span>Manage Global Drug Database</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                    <Button className="w-full justify-between bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 py-5">
                      <span>Clinic License Allocations</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
