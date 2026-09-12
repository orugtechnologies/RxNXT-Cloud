'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Loader2, 
  UserPlus, 
  Search, 
  Stethoscope, 
  CheckCircle2, 
  KeyRound, 
  Copy, 
  X, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Award, 
  FileBadge2, 
  Sparkles,
  UserCheck,
  UserX,
  RefreshCw
} from 'lucide-react';

const COMMON_SPECIALIZATIONS = [
  'General Physician',
  'Pediatrician / Child Specialist',
  'Internal Medicine',
  'Cardiologist',
  'Dermatologist',
  'Orthopedic Surgeon',
  'Gynecologist & Obstetrician',
  'ENT Specialist',
  'Ophthalmologist',
  'Dentist',
  'Pulmonologist',
  'Gastroenterologist',
  'Psychiatrist',
  'Diabetologist',
  'Other'
];

export default function TeamManagementPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [copied, setCopied] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    specialization: 'General Physician',
    customSpecialization: '',
    qualification: '',
    registrationNumber: '',
    medicalCouncil: '',
  });

  // Created credentials for instant handover
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    email: string;
    password: string;
    specialization: string;
    loginUrl: string;
  } | null>(null);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/clinic/team');
      const data = await res.json();
      if (data.team) setTeam(data.team);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `Rx#${randomPart}${Math.floor(100 + Math.random() * 900)}`;
    setFormData(prev => ({ ...prev, password: generated }));
  };

  const handleOpenAddModal = () => {
    generateSecurePassword();
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    const resolvedSpecialization = formData.specialization === 'Other' 
      ? (formData.customSpecialization.trim() || 'General Physician')
      : formData.specialization;

    try {
      const res = await fetch('/api/clinic/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          specialization: resolvedSpecialization,
          qualification: formData.qualification,
          registrationNumber: formData.registrationNumber,
          medicalCouncil: formData.medicalCouncil,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Failed to create doctor account');
        return;
      }

      // Store created credentials for immediate handover popup
      const loginUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : '/login';
      setCreatedCredentials({
        name: data.doctor?.fullName || formData.fullName,
        email: data.doctor?.email || formData.email,
        password: formData.password,
        specialization: resolvedSpecialization,
        loginUrl
      });

      // Reset form & close add modal
      setIsAddModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        specialization: 'General Physician',
        customSpecialization: '',
        qualification: '',
        registrationNumber: '',
        medicalCouncil: '',
      });

      // Refresh roster & show credentials handover card
      fetchTeam();
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      console.error(err);
      setFormError('An unexpected network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (doctor: any) => {
    const nextStatus = doctor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionName = nextStatus === 'ACTIVE' ? 'reactivate' : 'deactivate';

    if (!confirm(`Are you sure you want to ${actionName} ${doctor.fullName}? ${nextStatus === 'INACTIVE' ? 'They will no longer be able to log in or write prescriptions.' : 'They will regain immediate access to write prescriptions.'}`)) {
      return;
    }

    setTogglingId(doctor.id);
    try {
      const res = await fetch('/api/clinic/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: doctor.id, status: nextStatus })
      });

      if (res.ok) {
        fetchTeam();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update doctor status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `🏥 RxNXT Doctor Login Credentials\n\nDoctor: ${createdCredentials.name}\nSpecialization: ${createdCredentials.specialization}\nLogin Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\n\nLogin Portal: ${createdCredentials.loginUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <Loader2 className="animate-spin text-clinic-emerald h-8 w-8" />
        <p className="text-sm text-slate-500 font-medium">Loading clinical doctor roster...</p>
      </div>
    );
  }

  const filteredTeam = team.filter(doctor => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      doctor.fullName?.toLowerCase().includes(q) ||
      doctor.email?.toLowerCase().includes(q) ||
      doctor.specialization?.toLowerCase().includes(q) ||
      doctor.registrationNumber?.toLowerCase().includes(q)
    );
  });

  const activeCount = team.filter(d => d.status === 'ACTIVE').length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Stethoscope className="text-clinic-emerald mr-2.5" size={26} strokeWidth={2.5} />
            Manage Doctors
            <InfoTooltip text="Directly add doctors to your clinic. Doctor accounts are activated immediately with instant credentials for prescribing." />
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Active medical practitioners ({activeCount} active of {team.length} total)
          </p>
        </div>

        <Button 
          onClick={handleOpenAddModal}
          className="bg-clinic-emerald hover:bg-clinic-emeraldDark text-white font-bold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center shrink-0 text-sm"
        >
          <UserPlus className="h-4 w-4 mr-2 stroke-[2.5]" /> Add Doctor
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by doctor name, specialization, email, or registration number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-clinic-emerald/40 focus:border-clinic-emerald shadow-2xs transition-all"
          />
        </div>
        {searchQuery && (
          <Button 
            variant="ghost" 
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Doctor Roster */}
      {filteredTeam.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-white/70 p-12 text-center rounded-2xl">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 text-clinic-emerald flex items-center justify-center mb-4 shadow-2xs">
            <Stethoscope size={28} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No doctors found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            {searchQuery ? `No doctor matched "${searchQuery}". Try clearing your search query.` : 'Click "Add Doctor" above to onboard your first prescribing doctor.'}
          </p>
          {!searchQuery && (
            <Button 
              onClick={handleOpenAddModal}
              className="mt-5 bg-clinic-emerald hover:bg-clinic-emeraldDark text-white font-bold px-6 rounded-xl"
            >
              <UserPlus className="h-4 w-4 mr-2" /> Add First Doctor
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeam.map(doctor => {
            const isActive = doctor.status === 'ACTIVE';
            const isAdmin = doctor.role === 'clinic_admin';

            return (
              <div 
                key={doctor.id} 
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${
                  isActive ? 'border-slate-200/90' : 'border-slate-200/60 bg-slate-50/50 opacity-80'
                }`}
              >
                <div>
                  {/* Top Header: Avatar + Status */}
                  <div className="flex items-start justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-base shadow-2xs shrink-0 ${
                        isAdmin 
                          ? 'bg-blue-600 text-white' 
                          : isActive 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-slate-200 text-slate-600'
                      }`}>
                        {doctor.fullName?.replace('Dr.', '').trim().charAt(0).toUpperCase() || 'D'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-base leading-tight">
                            {doctor.fullName}
                          </h3>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                          {doctor.specialization || 'General Physician'}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={11} className="text-emerald-600" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    {doctor.qualification && (
                      <div className="flex items-center gap-2">
                        <Award size={14} className="text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-700">{doctor.qualification}</span>
                      </div>
                    )}
                    
                    {doctor.registrationNumber && (
                      <div className="flex items-center gap-2">
                        <FileBadge2 size={14} className="text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          Reg: {doctor.registrationNumber}
                        </span>
                        {doctor.medicalCouncil && (
                          <span className="text-[10px] text-slate-400">({doctor.medicalCouncil})</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400 shrink-0" />
                      <span className="text-slate-600 truncate">{doctor.email}</span>
                    </div>

                    {doctor.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        <span className="text-slate-600">{doctor.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Added {new Date(doctor.createdAt).toLocaleDateString()}
                  </span>

                  {!isAdmin ? (
                    <button
                      onClick={() => handleToggleStatus(doctor)}
                      disabled={togglingId === doctor.id}
                      className={`font-bold px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                        isActive
                          ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                          : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                      }`}
                    >
                      {togglingId === doctor.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : isActive ? (
                        <>Deactivate</>
                      ) : (
                        <>Reactivate</>
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Clinic Admin
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Add Doctor Direct Onboarding */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-clinic-navy px-6 py-4 flex justify-between items-center border-b border-clinic-border shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center">
                <UserPlus size={19} className="mr-2.5 text-clinic-emerald" />
                Add New Doctor
              </h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateDoctor} className="p-6 overflow-y-auto space-y-4">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* Personal & Login Info */}
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Doctor Name *
                    </Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Dr. Arvind Reddy"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Email Address (Login ID) *
                    </Label>
                    <Input
                      type="email"
                      required
                      placeholder="e.g. arvind.reddy@clinic.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Phone Number (Optional)
                    </Label>
                    <Input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Initial Password *
                      </Label>
                      <button
                        type="button"
                        onClick={generateSecurePassword}
                        className="text-[11px] font-bold text-clinic-emerald hover:underline flex items-center gap-1"
                      >
                        <RefreshCw size={11} /> Generate
                      </button>
                    </div>
                    <Input
                      type="text"
                      required
                      placeholder="Doctor login password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="mt-1 font-mono text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Medical & Regulatory Details */}
              <div className="pt-3 border-t border-slate-100 space-y-3.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Clinical & Legal Prescription Details
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Specialization *
                    </Label>
                    <select
                      value={formData.specialization}
                      onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                      className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none bg-white"
                    >
                      {COMMON_SPECIALIZATIONS.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  {formData.specialization === 'Other' ? (
                    <div>
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Custom Specialization *
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g. Pediatric Neurologist"
                        value={formData.customSpecialization}
                        onChange={e => setFormData({ ...formData, customSpecialization: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Medical Qualifications
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g. MBBS, MD, DCH"
                        value={formData.qualification}
                        onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Medical Registration No.
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. TSMC / 74821"
                      value={formData.registrationNumber}
                      onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Printed on official prescriptions</p>
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Medical Council
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. Telangana State Medical Council"
                      value={formData.medicalCouncil}
                      onChange={e => setFormData({ ...formData, medicalCouncil: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                  className="text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-clinic-emerald hover:bg-clinic-emeraldDark text-white font-bold px-5 rounded-xl shadow-md"
                >
                  {submitting ? (
                    <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Creating Account...</>
                  ) : (
                    <><CheckCircle2 className="mr-2 h-4 w-4" /> Create Doctor Account</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Success Credential Handover Card */}
      {isSuccessModalOpen && createdCredentials && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white text-center relative">
              <div className="mx-auto w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <h3 className="text-lg font-extrabold tracking-tight">Doctor Account Activated!</h3>
              <p className="text-emerald-100 text-xs mt-1">
                {createdCredentials.name} can now sign in and prescribe immediately.
              </p>
            </div>

            {/* Credentials Card Body */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs font-medium text-slate-700">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Doctor</span>
                  <span className="font-bold text-slate-900">{createdCredentials.name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Specialization</span>
                  <span className="font-semibold text-emerald-700">{createdCredentials.specialization}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Login Email</span>
                  <span className="font-bold text-slate-900 font-mono select-all">{createdCredentials.email}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Password</span>
                  <span className="font-bold text-indigo-700 font-mono text-sm bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 select-all">
                    {createdCredentials.password}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase tracking-wider font-bold text-[10px]">Login Portal</span>
                  <span className="font-mono text-slate-500 text-[11px] truncate max-w-[200px]">{createdCredentials.loginUrl}</span>
                </div>
              </div>

              {/* Handover Actions */}
              <div className="space-y-2 pt-1">
                <Button
                  onClick={handleCopyCredentials}
                  className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center"
                >
                  {copied ? (
                    <><CheckCircle2 className="h-4 w-4 mr-2" /> Copied to Clipboard!</>
                  ) : (
                    <><Copy className="h-4 w-4 mr-2" /> Copy Credentials for Doctor</>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="w-full text-slate-700 border-slate-200 hover:bg-slate-50 font-bold py-2.5 rounded-xl"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

