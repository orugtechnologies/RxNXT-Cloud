'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users, PlusCircle, Building2, Stethoscope, PhoneCall, X } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'receptionist'
  });

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/clinic/staff');
      const data = await res.json();
      if (data.staff) setStaff(data.staff);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/clinic/staff/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create staff account');
      } else {
        setIsModalOpen(false);
        setFormData({ fullName: '', email: '', password: '', role: 'receptionist' });
        fetchStaff();
        alert('Staff account created successfully! You can hand these credentials to your staff member.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'receptionist') {
      return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"><PhoneCall className="w-3 h-3" /> Front Desk</span>;
    }
    if (role === 'nurse') {
      return <span className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"><Stethoscope className="w-3 h-3" /> Nurse</span>;
    }
    return null;
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-clinic-blue h-8 w-8" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            Support Staff
            <InfoTooltip text="Create accounts for your front desk and nursing staff. Support staff have restricted dashboards tailored to their specific daily tasks." />
          </h1>
          <p className="text-slate-500">Manage non-doctor staff like Receptionists and Nurses.</p>
        </div>
        <Button className="bg-clinic-blue hover:bg-clinic-blueDark" onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" /> Add Staff Member
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create Staff Account</h2>
                <p className="text-sm text-slate-500 mt-1">Create an account directly for your staff.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 p-6 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  required 
                  value={formData.fullName} 
                  onChange={e => setFormData({...formData, fullName: e.target.value})} 
                  placeholder="e.g. Priya Sharma"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select 
                  id="role"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="receptionist">Receptionist (Front Desk)</option>
                  <option value="nurse">Nurse / Medical Assistant</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="frontdesk@clinic.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <Input 
                  id="password" 
                  type="text" 
                  required 
                  minLength={6}
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  placeholder="Minimum 6 characters"
                />
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-500" />
            Clinic Staff ({staff.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {staff.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No staff members found. Click "Add Staff Member" to create one.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {staff.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="font-semibold text-slate-900 flex items-center gap-2">
                      {member.fullName}
                      {getRoleBadge(member.role)}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">{member.email}</p>
                  </div>
                  <div className="text-sm text-slate-400">
                    Joined {new Date(member.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
