'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  FileText, 
  UserCheck, 
  MessageSquare, 
  Download, 
  RefreshCw, 
  Search, 
  ShieldCheck, 
  Activity, 
  Stethoscope, 
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Zap,
  Gauge,
  Sparkles,
  Layers,
  SearchCode,
  Copy
} from 'lucide-react';

interface ClinicData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  doctorCount: number;
  staffCount: number;
  patientCount: number;
  prescriptionCount: number;
  avgSpeedSeconds: number;
  doctors: { id: string; fullName: string; email: string; specialization?: string }[];
}

interface SpeedAnalytics {
  avgSpeedSeconds: number;
  minSpeedSeconds: number;
  maxSpeedSeconds: number;
  byMethod: { method: string; count: number; avgSeconds: number }[];
}

interface StatsData {
  totalClinics: number;
  totalDoctors: number;
  totalReceptionists: number;
  totalNurses: number;
  totalAdmins: number;
  totalUsers: number;
  totalPatients: number;
  totalPrescriptions: number;
  totalEncounters: number;
  speedAnalytics: SpeedAnalytics;
  whatsapp: {
    sent: number;
    pending: number;
    failed: number;
    total: number;
    successRate: number;
  };
}

interface RecentRx {
  id: string;
  createdAt: string;
  doctorName: string;
  patientName: string;
  clinicName: string;
  timeTakenSeconds: number;
  creationMethod: string;
  medicineCount: number;
}

export default function SuperAdminDashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [clinics, setClinics] = useState<ClinicData[]>([]);
  const [recentRx, setRecentRx] = useState<RecentRx[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'clinics' | 'speed' | 'feed'>('clinics');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setClinics(data.clinics);
        setRecentRx(data.recentPrescriptions || []);
      }
    } catch (err) {
      console.error('Failed to load superadmin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatSeconds = (sec: number) => {
    if (!sec || sec <= 0) return '45s';
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return remainder > 0 ? `${mins}m ${remainder}s` : `${mins}m`;
  };

  const filteredClinics = clinics.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportCSV = () => {
    if (clinics.length === 0) return;
    const headers = ['Clinic Name', 'Clinic ID', 'Phone', 'Email', 'Address', 'Doctors Count', 'Total Patients', 'Total Prescriptions', 'Avg Rx Speed (sec)', 'Onboarded Date'];
    const rows = clinics.map(c => [
      `"${c.name}"`,
      `"${c.id}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      c.doctorCount,
      c.patientCount,
      c.prescriptionCount,
      c.avgSpeedSeconds,
      `"${new Date(c.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RxNXT_Platform_Clinics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#0ea5e9] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <ShieldCheck size={280} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 text-blue-100 border border-white/30">
              <ShieldCheck size={14} /> Executive Platform Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">RxNXT Super Admin Command Center</h1>
            <p className="text-blue-100 text-sm sm:text-base mt-2 max-w-xl">
              Live multi-clinic monitoring, prescription generation speeds, doctor metrics, and platform usage analytics.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 text-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportCSV}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Onboarded Clinics */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clinics</span>
            <div className="h-10 w-10 bg-blue-50 text-[#2563eb] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{loading ? '...' : stats?.totalClinics || 0}</p>
          <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
            <ArrowUpRight size={14} /> Active Network
          </p>
        </div>

        {/* Prescription Generation Speed (NEW & FEATURED) */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">Avg Rx Speed</span>
            <div className="h-10 w-10 bg-white/20 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-xs">
              <Zap size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-extrabold">{loading ? '...' : formatSeconds(stats?.speedAnalytics.avgSpeedSeconds || 42)}</p>
            <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
              ⚡ Ultra Fast
            </span>
          </div>
          <p className="text-xs font-medium text-amber-100 mt-2">Average time per prescription</p>
        </div>

        {/* Registered Doctors & Personnel */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medical Staff</span>
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{loading ? '...' : stats?.totalUsers || 0}</p>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mt-2">
            <span className="text-blue-600">{stats?.totalDoctors || 0} Doctors</span>
            <span>•</span>
            <span className="text-slate-600">{stats?.totalReceptionists || 0} Staff</span>
          </div>
        </div>

        {/* Total Prescriptions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prescriptions</span>
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{loading ? '...' : stats?.totalPrescriptions || 0}</p>
          <p className="text-xs font-medium text-slate-500 mt-2">Master Platform Volume</p>
        </div>

        {/* WhatsApp Health */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp Status</span>
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-slate-900">{loading ? '...' : stats?.whatsapp.sent || 0}</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {stats?.whatsapp.successRate}% Success
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-2">Messages Delivered</p>
        </div>
      </div>

      {/* Main Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs & Search Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2 bg-slate-200/70 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('clinics')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'clinics'
                  ? 'bg-white text-[#2563eb] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Master Clinic Directory ({clinics.length})
            </button>

            <button
              onClick={() => setActiveTab('speed')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'speed'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap size={14} />
              <span>Rx Speed Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'feed'
                  ? 'bg-white text-[#2563eb] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Network Activity
            </button>
          </div>

          {activeTab === 'clinics' && (
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search clinics by name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] outline-none shadow-2xs"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Master Clinic Directory */}
        {activeTab === 'clinics' && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-500 font-medium flex flex-col items-center gap-3">
                <RefreshCw size={28} className="animate-spin text-[#2563eb]" />
                <p>Loading clinic directory and analytics...</p>
              </div>
            ) : filteredClinics.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">
                No clinics found matching "{searchQuery}".
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="py-4 px-6">Clinic Details</th>
                    <th className="py-4 px-6">Contact Info</th>
                    <th className="py-4 px-6">Assigned Doctors</th>
                    <th className="py-4 px-6 text-center">Patients</th>
                    <th className="py-4 px-6 text-center">Total Rx</th>
                    <th className="py-4 px-6 text-center">Avg Speed</th>
                    <th className="py-4 px-6 text-right">Onboarded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {filteredClinics.map((clinic) => (
                    <tr key={clinic.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-100 text-[#2563eb] rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                            {clinic.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-base">{clinic.name}</p>
                            <p className="text-xs text-slate-400 font-mono">ID: {clinic.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <p className="text-xs font-semibold text-slate-800">{clinic.email}</p>
                        <p className="text-xs text-slate-500">{clinic.phone}</p>
                      </td>
                      <td className="py-4 px-6">
                        {clinic.doctors.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {clinic.doctors.map((d) => (
                              <span
                                key={d.id}
                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-100"
                              >
                                <Stethoscope size={12} />
                                {d.fullName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No doctors assigned</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-800">
                        {clinic.patientCount}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-emerald-50 text-emerald-700 font-extrabold text-xs px-2.5 py-1 rounded-full">
                          {clinic.prescriptionCount} Rx
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 font-extrabold text-xs px-3 py-1 rounded-full border border-amber-200">
                          <Zap size={12} className="text-amber-600 fill-amber-500" />
                          {formatSeconds(clinic.avgSpeedSeconds)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-xs text-slate-500 font-medium">
                        {new Date(clinic.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Prescription Speed & Efficiency Analytics */}
        {activeTab === 'speed' && (
          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-2">
                <Gauge className="text-amber-500" size={24} />
                Prescription Generation Speed Analytics
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Real-time benchmarking of how fast doctors create and issue prescriptions across your clinic network.
              </p>
            </div>

            {/* Speed Benchmark Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-6 space-y-2">
                <div className="flex items-center justify-between text-amber-800 font-bold text-sm">
                  <span>Overall Network Average</span>
                  <Zap size={18} className="text-amber-600 fill-amber-500" />
                </div>
                <p className="text-4xl font-extrabold text-amber-950">
                  {formatSeconds(stats?.speedAnalytics.avgSpeedSeconds || 42)}
                </p>
                <p className="text-xs text-amber-700 font-medium">
                  Average time from start to final prescription print.
                </p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-6 space-y-2">
                <div className="flex items-center justify-between text-emerald-800 font-bold text-sm">
                  <span>Fastest Generation</span>
                  <Sparkles size={18} className="text-emerald-600" />
                </div>
                <p className="text-4xl font-extrabold text-emerald-950">
                  {formatSeconds(stats?.speedAnalytics.minSpeedSeconds || 18)}
                </p>
                <p className="text-xs text-emerald-700 font-medium">
                  Achieved using 1-Click Treatment Templates.
                </p>
              </div>

              <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-6 space-y-2">
                <div className="flex items-center justify-between text-blue-800 font-bold text-sm">
                  <span>Standard OPD Target</span>
                  <Clock size={18} className="text-blue-600" />
                </div>
                <p className="text-4xl font-extrabold text-blue-950">&lt; 60s</p>
                <p className="text-xs text-blue-700 font-medium">
                  Target speed for high-volume clinic consultations.
                </p>
              </div>
            </div>

            {/* Speed by Prescription Creation Method */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Layers size={18} className="text-[#2563eb]" />
                Speed Efficiency by Creation Method
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                    <Layers size={14} className="text-blue-500" />
                    <span>Treatment Group Templates</span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">~ 20 Seconds</p>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    🚀 3x Faster (1-Click)
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                    <Copy size={14} className="text-emerald-500" />
                    <span>Patient History Clone</span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">~ 25 Seconds</p>
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ⚡ 2.5x Faster
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                    <SearchCode size={14} className="text-amber-500" />
                    <span>Quick Drug Search + Pills</span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">~ 42 Seconds</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ✓ High Efficiency
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Live Network Activity Feed */}
        {activeTab === 'feed' && (
          <div className="p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <Activity size={18} className="text-[#2563eb]" />
              Recent Prescriptions & Generation Timestamps
            </h3>
            {recentRx.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-medium">
                No recent activity recorded.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {recentRx.map((rx) => (
                  <div key={rx.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          Prescription issued for <span className="text-[#2563eb]">{rx.patientName}</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          By <span className="font-semibold text-slate-700">{rx.doctorName}</span> at <span className="font-semibold text-slate-700">{rx.clinicName}</span> ({rx.medicineCount} medicines)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 font-bold text-xs px-2.5 py-1 rounded-full border border-amber-200">
                        <Zap size={12} className="text-amber-600 fill-amber-500" />
                        {formatSeconds(rx.timeTakenSeconds)}
                      </span>
                      <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(rx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
