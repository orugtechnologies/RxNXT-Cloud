'use client';

import { useAuth } from '@/hooks/useAuth';
import { ShieldCheck, Activity, Users, Building2, Server, LogOut, ArrowUpRight, BarChart3, Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SuperAdminDashboardPage() {
  const { user, profile, signOut } = useAuth();

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
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">Isolated Portal</span>
              </h1>
              <p className="text-xs text-slate-400">Global System Management & Infrastructure Health</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{profile?.full_name || user?.email}</p>
            <p className="text-xs text-indigo-400 font-mono">Super Admin</p>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Metrics overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Active Clinics', value: '14', change: '+2 this week', icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Registered Doctors', value: '38', change: 'Across all clinics', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Prescriptions Issued', value: '1,248', change: '+18% vs last month', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'System Uptime', value: '99.98%', change: 'PostgreSQL & NextAuth', icon: Server, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((item, idx) => (
          <Card key={idx} className="border-slate-800 bg-slate-900/60 backdrop-blur">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{item.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
                <p className="text-xs text-slate-500 mt-1">{item.change}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-800 bg-slate-900/60 backdrop-blur">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-400" />
                Platform Infrastructure & Services
              </h2>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-mono">All Systems Operational</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Database Cluster', detail: 'PostgreSQL - Local / Render', status: 'Healthy' },
                { name: 'WhatsApp Bot Service', detail: 'rxnxt-whatsapp-service.onrender.com', status: 'Connected' },
                { name: 'Authentication Layer', detail: 'NextAuth JWT offline provider', status: 'Active' },
                { name: 'Drug Master Catalog', detail: 'Indian Pharmacopoeia + Schedule X rules', status: 'Up-to-date' },
              ].map((svc, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{svc.name}</p>
                    <p className="text-xs text-slate-500">{svc.detail}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-md">
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
  );
}
