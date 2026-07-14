'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Copy, RefreshCw, UserCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function TeamManagementPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshingLink, setRefreshingLink] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/clinic/team');
      const data = await res.json();
      if (data.team) setTeam(data.team);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInviteCode = async () => {
    try {
      const res = await fetch('/api/clinic/invite');
      const data = await res.json();
      if (data.inviteCode) setInviteCode(data.inviteCode);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchTeam(), fetchInviteCode()]).finally(() => setLoading(false));
  }, []);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/register?invite=${inviteCode}`;
    navigator.clipboard.writeText(link);
    alert('Invite link copied to clipboard!');
  };

  const handleRegenerateLink = async () => {
    if (!confirm('Are you sure? This will instantly invalidate the current invite link. Any doctors trying to use it will be blocked.')) return;
    
    setRefreshingLink(true);
    try {
      const res = await fetch('/api/clinic/invite', { method: 'POST' });
      const data = await res.json();
      if (data.inviteCode) {
        setInviteCode(data.inviteCode);
        alert('Link successfully regenerated.');
      }
    } catch (err) {
      alert('Failed to regenerate link.');
    }
    setRefreshingLink(false);
  };

  const handleApprove = async (userId: string) => {
    setApprovingId(userId);
    try {
      const res = await fetch('/api/clinic/team/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        fetchTeam(); // refresh the list
      } else {
        alert('Failed to approve doctor.');
      }
    } catch (err) {
      alert('Error approving doctor.');
    }
    setApprovingId(null);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-clinic-blue h-8 w-8" /></div>;
  }

  const pendingDoctors = team.filter(d => d.status === 'PENDING');
  const activeDoctors = team.filter(d => d.status === 'ACTIVE');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-500">Manage your clinic doctors and pending invites.</p>
        </div>
      </div>

      <Card className="border-indigo-100 shadow-sm">
        <CardHeader className="bg-indigo-50/50 border-b border-indigo-50">
          <CardTitle className="text-indigo-900 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-500" />
            Invite Doctors (Secure Link)
          </CardTitle>
          <CardDescription>
            Share this link securely via WhatsApp. Doctors who register using this link will be added to your clinic and placed in the Pending Approval queue.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Input 
              value={`${window.location.origin}/register?invite=${inviteCode}`} 
              readOnly 
              className="bg-slate-50 text-slate-600 font-mono"
            />
            <Button onClick={handleCopyLink} className="shrink-0 bg-indigo-600 hover:bg-indigo-700">
              <Copy className="h-4 w-4 mr-2" /> Copy
            </Button>
            <Button onClick={handleRegenerateLink} variant="outline" className="shrink-0 text-red-600 border-red-200 hover:bg-red-50" disabled={refreshingLink}>
              {refreshingLink ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Kill Switch
            </Button>
          </div>
        </CardContent>
      </Card>

      {pendingDoctors.length > 0 && (
        <Card className="border-orange-200 shadow-sm">
          <CardHeader className="bg-orange-50 border-b border-orange-100">
            <CardTitle className="text-orange-900 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-orange-600" />
              Pending Approvals ({pendingDoctors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {pendingDoctors.map(doctor => (
                <div key={doctor.id} className="flex items-center justify-between p-4 bg-orange-50/30">
                  <div>
                    <p className="font-semibold text-slate-900">{doctor.fullName}</p>
                    <p className="text-sm text-slate-500">{doctor.email} • {doctor.specialization || 'General'}</p>
                  </div>
                  <Button 
                    onClick={() => handleApprove(doctor.id)} 
                    disabled={approvingId === doctor.id}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {approvingId === doctor.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    Approve Doctor
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-slate-900">Active Team ({activeDoctors.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {activeDoctors.map(doctor => (
              <div key={doctor.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {doctor.fullName} 
                    {doctor.role === 'clinic_admin' && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Admin</span>}
                  </p>
                  <p className="text-sm text-slate-500">{doctor.email} • {doctor.specialization || 'General'}</p>
                </div>
                <div className="text-sm text-slate-400">
                  Joined {new Date(doctor.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
