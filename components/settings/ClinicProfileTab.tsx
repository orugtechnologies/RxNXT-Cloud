'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Building2, Image as ImageIcon, UploadCloud, FileSignature } from 'lucide-react';

export default function ClinicProfileTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    registrationNumber: '',
    logoUrl: '',
    signatureUrl: ''
  });

  useEffect(() => {
    fetch('/api/clinic')
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setFormData({
            name: json.data.name || '',
            phone: json.data.phone || '',
            email: json.data.email || '',
            address: json.data.address || '',
            registrationNumber: json.data.registrationNumber || '',
            logoUrl: json.data.logoUrl || '',
            signatureUrl: json.data.signatureUrl || ''
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (type: 'logo' | 'signature') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to S3/Cloud Storage here and get URL.
      // For this MVP, we create a local object URL to display it visually.
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, [type === 'logo' ? 'logoUrl' : 'signatureUrl']: url });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/clinic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to save');
      alert('Clinic profile updated successfully!');
    } catch (err) {
      alert('Error updating clinic profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 flex items-center justify-center"><Loader2 className="animate-spin mr-2" /> Loading profile...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-clinic-navy px-6 py-4 border-b border-clinic-border flex items-center">
        <Building2 className="text-clinic-emerald mr-2" size={20} />
        <h2 className="text-lg font-bold text-white">Clinic Profile</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Clinic Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none" placeholder="e.g. City Health Clinic" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none" placeholder="e.g. +91 9876543210" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none" placeholder="e.g. contact@cityhealth.com" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Doctor Registration Number</label>
            <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none" placeholder="e.g. MCI-123456" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Clinic Address (Appears on Prescription)</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none resize-none" placeholder="Enter full clinic address..." />
          </div>

          <div className="md:col-span-2 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-bold text-clinic-navy mb-4 flex items-center">
              <FileSignature className="mr-2 text-clinic-emerald" size={18} />
              Branding & Digital Signature
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Logo Upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                <input type="file" accept="image/*" onChange={handleFileUpload('logo')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {formData.logoUrl ? (
                  <div className="flex flex-col items-center">
                    <img src={formData.logoUrl} alt="Clinic Logo" className="h-16 object-contain mb-3" />
                    <span className="text-xs text-clinic-emerald font-bold">Logo Uploaded (Click to change)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                      <ImageIcon size={24} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Upload Clinic Logo</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</span>
                  </div>
                )}
              </div>

              {/* Signature Upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                <input type="file" accept="image/*" onChange={handleFileUpload('signature')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {formData.signatureUrl ? (
                  <div className="flex flex-col items-center">
                    <img src={formData.signatureUrl} alt="Digital Signature" className="h-16 object-contain mb-3" />
                    <span className="text-xs text-clinic-emerald font-bold">Signature Uploaded (Click to change)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
                      <UploadCloud size={24} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">Upload Digital Signature</span>
                    <span className="text-xs text-gray-500 mt-1">Transparent PNG recommended</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving} className="bg-clinic-emerald hover:bg-clinic-emeraldDark text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center disabled:opacity-70">
            {saving ? <><Loader2 className="animate-spin mr-2" size={18} /> Saving...</> : <><Save className="mr-2" size={18} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
