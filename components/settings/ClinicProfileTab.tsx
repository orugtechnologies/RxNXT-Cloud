'use client';

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Loader2, 
  Building2, 
  Image as ImageIcon, 
  UploadCloud, 
  FileSignature, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  Sliders, 
  Sparkles,
  Eye
} from 'lucide-react';

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
    signatureUrl: '',
    prescriptionPadUrl: '',
    prescriptionHeaderHeight: 48,
    prescriptionFooterHeight: 30
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
            signatureUrl: json.data.signatureUrl || '',
            prescriptionPadUrl: json.data.prescriptionPadUrl || '',
            prescriptionHeaderHeight: json.data.prescriptionHeaderHeight ?? 48,
            prescriptionFooterHeight: json.data.prescriptionFooterHeight ?? 30
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileUpload = (type: 'logo' | 'signature' | 'pad') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB. Please select an image under 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawData = event.target?.result as string;
        // Optimize and compress image dimensions using canvas
        const img = new Image();
        img.onload = () => {
          const maxDim = type === 'pad' ? 1600 : type === 'logo' ? 400 : 500;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // JPEG at 0.85 compression delivers crisp A4 print quality under ~150KB
            const format = type === 'pad' ? 'image/jpeg' : 'image/png';
            const quality = type === 'pad' ? 0.85 : undefined;
            const compressed = canvas.toDataURL(format, quality);

            const fieldName = type === 'pad' ? 'prescriptionPadUrl' : type === 'logo' ? 'logoUrl' : 'signatureUrl';
            setFormData(prev => ({ ...prev, [fieldName]: compressed }));
          } else {
            const fieldName = type === 'pad' ? 'prescriptionPadUrl' : type === 'logo' ? 'logoUrl' : 'signatureUrl';
            setFormData(prev => ({ ...prev, [fieldName]: rawData }));
          }
        };
        img.onerror = () => {
          const fieldName = type === 'pad' ? 'prescriptionPadUrl' : type === 'logo' ? 'logoUrl' : 'signatureUrl';
          setFormData(prev => ({ ...prev, [fieldName]: rawData }));
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    }
  };

  const removePrescriptionPad = () => {
    if (confirm('Revert to the standard prescription template?')) {
      setFormData(prev => ({ ...prev, prescriptionPadUrl: '' }));
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
      alert('Clinic profile & prescription letterhead updated successfully!');
    } catch (err) {
      alert('Error updating clinic profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" /> Loading profile...
      </div>
    );
  }

  // Calculate percentage offsets for A4 preview guideline (A4 height = 297mm)
  const headerPercent = Math.min(Math.max((formData.prescriptionHeaderHeight / 297) * 100, 10), 40);
  const footerPercent = Math.min(Math.max((formData.prescriptionFooterHeight / 297) * 100, 5), 25);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-clinic-navy px-6 py-4 border-b border-clinic-border flex items-center justify-between">
        <div className="flex items-center">
          <Building2 className="text-clinic-emerald mr-2" size={20} />
          <h2 className="text-lg font-bold text-white">Clinic Profile & Prescription Branding</h2>
        </div>
        <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-1 rounded-full border border-emerald-400/30">
          NMC / NABH Aligned
        </span>
      </div>

      <div className="p-6 space-y-8">
        
        {/* SECTION 1: CLINIC DETAILS */}
        <div>
          <h3 className="text-sm font-bold text-clinic-navy uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            1. Clinic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Clinic Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none" 
                placeholder="e.g. City Health Clinic" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none" 
                placeholder="e.g. +91 9876543210" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none" 
                placeholder="e.g. contact@cityhealth.com" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Doctor Registration Number</label>
              <input 
                type="text" 
                name="registrationNumber" 
                value={formData.registrationNumber} 
                onChange={handleChange} 
                className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none" 
                placeholder="e.g. MCI-123456" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Clinic Address (Appears on Prescription)</label>
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                rows={3} 
                className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-clinic-emerald focus:border-clinic-emerald outline-none resize-none" 
                placeholder="Enter full clinic address..." 
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: SCANNED PRESCRIPTION PAD LETTERHEAD (DOCTOR AUTHENTICITY) */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              <h3 className="text-base font-extrabold text-slate-900">
                Doctor Scanned Prescription Pad / Letterhead (Soft Copy)
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles size={13} /> Authentic Doctor Letterhead
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-5 leading-relaxed">
            Upload your clinic's authentic scanned prescription pad or letterhead. RxNXT will imprint patient details, medicines, dosages, and QR verification directly onto your own soft copy, preserving 100% doctor authenticity on Live Preview, PDF downloads, and WhatsApp delivery.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Upload & Configuration Controls */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 rounded-xl p-6 text-center transition-all relative">
                <input 
                  type="file" 
                  accept="image/png,image/jpeg,image/jpg,image/webp" 
                  onChange={handleFileUpload('pad')} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                
                {formData.prescriptionPadUrl ? (
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 shadow-xs">
                      <CheckCircle2 size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-900">Custom Prescription Pad Active</span>
                    <span className="text-xs text-blue-600 font-semibold mt-1">Click to replace with a new image</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Supports PNG, JPG, WebP</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 shadow-xs">
                      <UploadCloud size={24} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">Upload Doctor's Original Scanned Pad</span>
                    <span className="text-xs text-slate-500 mt-1">PNG, JPG, or WebP up to 8MB</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">Will automatically optimize for instant WhatsApp & PDF rendering</span>
                  </div>
                )}
              </div>

              {formData.prescriptionPadUrl && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <Sliders size={14} className="text-blue-600" />
                      <span>Print Alignment Calibration</span>
                    </div>
                    <button
                      type="button"
                      onClick={removePrescriptionPad}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Trash2 size={13} /> Remove Custom Pad
                    </button>
                  </div>

                  {/* Header Top Margin Slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <label className="font-semibold text-slate-700">
                        Header Top Clearance (mm):
                      </label>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {formData.prescriptionHeaderHeight} mm
                      </span>
                    </div>
                    <input 
                      type="range" 
                      name="prescriptionHeaderHeight" 
                      min="30" 
                      max="90" 
                      step="1"
                      value={formData.prescriptionHeaderHeight} 
                      onChange={handleChange} 
                      className="w-full accent-blue-600 cursor-pointer" 
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Adjust so digital medicines and patient details start below your printed letterhead header.
                    </p>
                  </div>

                  {/* Footer Bottom Margin Slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <label className="font-semibold text-slate-700">
                        Footer Bottom Clearance (mm):
                      </label>
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {formData.prescriptionFooterHeight} mm
                      </span>
                    </div>
                    <input 
                      type="range" 
                      name="prescriptionFooterHeight" 
                      min="15" 
                      max="60" 
                      step="1"
                      value={formData.prescriptionFooterHeight} 
                      onChange={handleChange} 
                      className="w-full accent-blue-600 cursor-pointer" 
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Reserves clearance at the bottom of the page so digital signature & QR code do not collide with your printed footer contact info.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Live A4 Visual Alignment Thumbnail */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Eye size={13} className="text-blue-600" />
                <span>A4 Alignment Simulation</span>
              </div>

              {formData.prescriptionPadUrl ? (
                <div 
                  className="w-full max-w-[240px] aspect-[1/1.414] bg-white rounded-lg border-2 border-slate-300 shadow-md relative overflow-hidden bg-cover bg-no-repeat"
                  style={{ backgroundImage: `url(${formData.prescriptionPadUrl})`, backgroundSize: '100% 100%' }}
                >
                  {/* Visual Header Clearance Boundary */}
                  <div 
                    className="absolute top-0 left-0 right-0 border-b-2 border-dashed border-rose-500 bg-rose-500/10 flex items-end justify-center pb-1 text-[9px] font-bold text-rose-700 select-none"
                    style={{ height: `${headerPercent}%` }}
                  >
                    <span>Letterhead Header Area</span>
                  </div>

                  {/* Visual Printable Rx Zone */}
                  <div 
                    className="absolute left-2 right-2 border border-blue-400 bg-blue-50/50 rounded flex flex-col items-center justify-center p-2 text-center select-none"
                    style={{ 
                      top: `calc(${headerPercent}% + 4px)`, 
                      bottom: `calc(${footerPercent}% + 4px)` 
                    }}
                  >
                    <span className="text-[10px] font-black text-blue-900 uppercase">℞ Medicines</span>
                    <span className="text-[8px] text-blue-700 font-medium">Digital Details Overlay</span>
                  </div>

                  {/* Visual Footer Clearance Boundary */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-amber-500 bg-amber-500/10 flex items-start justify-center pt-1 text-[9px] font-bold text-amber-700 select-none"
                    style={{ height: `${footerPercent}%` }}
                  >
                    <span>Signature & QR Area</span>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-[240px] aspect-[1/1.414] bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center text-slate-400">
                  <FileText size={32} className="text-slate-300 mb-2" />
                  <span className="text-xs font-semibold text-slate-600">Standard Template Mode</span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Upload your scanned pad above to switch to authentic doctor letterhead mode.
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* SECTION 3: LOGO & DIGITAL SIGNATURE */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-sm font-bold text-clinic-navy uppercase tracking-wider mb-4 flex items-center">
            <FileSignature className="mr-2 text-clinic-emerald" size={18} />
            3. Clinic Logo & Digital Doctor Signature
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

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-clinic-emerald hover:bg-clinic-emeraldDark text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all flex items-center disabled:opacity-70 cursor-pointer"
          >
            {saving ? (
              <><Loader2 className="animate-spin mr-2" size={18} /> Saving...</>
            ) : (
              <><Save className="mr-2" size={18} /> Save Changes</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
