'use client';

import React, { useState } from 'react';
import { X, CheckCircle, User, Stethoscope, Pill, FileText, Activity, Send, Loader2, Sparkles } from 'lucide-react';
import { PrescribedMedicine } from './PrescriptionCart';
import { Patient } from '../patients/PatientSearchUI';

interface ReviewModalProps {
  patient: Patient;
  chiefComplaint: string;
  diagnosis: string;
  medicines: PrescribedMedicine[];
  notes: string;
  followUpDate: string;
  saving: boolean;
  isSuccess?: boolean;
  prescriptionId?: string;
  pdfBase64?: string | null;
  timeTakenSeconds?: number | null;
  onClose: () => void;
  onConfirm: () => void;
  onNewPrescription?: () => void;
  onGoToDashboard?: () => void;
}

export default function ReviewPrescriptionModal({
  patient,
  chiefComplaint,
  diagnosis,
  medicines,
  notes,
  followUpDate,
  saving,
  isSuccess,
  prescriptionId,
  pdfBase64,
  timeTakenSeconds,
  onClose,
  onConfirm,
  onNewPrescription,
  onGoToDashboard
}: ReviewModalProps) {
  const [isSending, setIsSending] = useState(false);

  const sendViaWhatsApp = async () => {
    if (!prescriptionId) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/prescriptions/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId, pdfBase64 })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send WhatsApp message');
      }
      
      if (timeTakenSeconds) {
        alert(`✅ Prescription sent successfully! (Completed in ${timeTakenSeconds} seconds 🚀)`);
      } else {
        alert('✅ Prescription sent successfully!');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'WhatsApp is not connected yet') {
        alert('WhatsApp is still connecting in the background (or the microservice is waking up). Please wait 15-20 seconds and click Send again.');
      } else {
        alert(err.message || 'Error sending WhatsApp message');
      }
    } finally {
      setIsSending(false);
    }
  };

  if (isSuccess) {
    const handleGoToDashboard = () => {
      if (onGoToDashboard) {
        onGoToDashboard();
      } else {
        window.location.href = '/doctor/dashboard';
      }
    };

    return (
      <div className="fixed inset-0 bg-clinic-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200 text-center p-8">
          
          {/* Top-Right Cancel (X) Button */}
          <button
            onClick={handleGoToDashboard}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors flex items-center justify-center"
            title="Close & Return to Patient Queue"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 bg-emerald-100 text-clinic-emerald rounded-full flex items-center justify-center">
              <CheckCircle size={40} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-clinic-navy mb-2">Prescription Generated!</h2>
          <p className="text-slate-500 mb-8">
            The PDF has been created for <span className="font-bold">{patient.name}</span>. You can now send it securely via WhatsApp.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={sendViaWhatsApp}
              disabled={isSending}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70"
            >
              {isSending ? (
                <><Loader2 className="animate-spin mr-2" size={20}/> Sending...</>
              ) : (
                <><Send className="mr-2" size={20}/> Send Rx via WhatsApp</>
              )}
            </button>
            <button
              onClick={onNewPrescription}
              className="w-full bg-white hover:bg-slate-50 text-clinic-navy border border-slate-200 font-bold py-3 px-6 rounded-xl transition-all"
            >
              Start New Prescription
            </button>
            <button
              onClick={handleGoToDashboard}
              className="w-full text-slate-500 hover:text-slate-800 text-xs font-semibold py-2 transition-colors flex items-center justify-center gap-1"
            >
              ← Return to Patient Queue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-clinic-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-clinic-navy px-6 py-4 flex justify-between items-center border-b border-clinic-border shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center">
            <CheckCircle size={20} className="mr-2 text-clinic-emerald" />
            Review Prescription
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Patient Info */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-4">
            <div className="bg-blue-100 text-blue-700 h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-clinic-navy text-lg">{patient.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {patient.age} years • {patient.gender} {patient.phone ? `• ${patient.phone}` : ''}
              </p>
            </div>
          </div>

          {/* AI Present-Day Treatment Summary Preview Card */}
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/50 p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-100">
              <div className="p-1 rounded-md bg-indigo-600 text-white shadow-xs">
                <Sparkles size={14} className="animate-pulse" />
              </div>
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Treatment Summary (Included in WhatsApp Message)
              </h4>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              {diagnosis && (
                <p><span className="font-bold text-indigo-900">🩺 Diagnosis:</span> {diagnosis}</p>
              )}
              
              <div>
                <span className="font-bold text-indigo-900">💊 Prescribed Medicines ({medicines.length}):</span>
                <ul className="mt-1 space-y-1 pl-2">
                  {medicines.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                      <span className="font-semibold">{m.name}</span>
                      <span className="text-slate-500">
                        ({[m.dosage_form, m.strength].filter(Boolean).join(' ') || 'Standard'}) • Dose: <strong className="text-indigo-900">{m.frequency}</strong> for {m.duration} {m.instructions ? `[${m.instructions}]` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {notes && (
                <p className="mt-1 pt-1 border-t border-indigo-100/60"><span className="font-bold text-indigo-900">📝 Doctor Advice:</span> {notes}</p>
              )}
            </div>
          </div>

          {/* Clinical Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                <User size={14} className="mr-1.5" /> Chief Complaint
              </h3>
              <p className="text-sm font-medium text-clinic-navy">{chiefComplaint || 'Not specified'}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                <Stethoscope size={14} className="mr-1.5" /> Diagnosis
              </h3>
              <p className="text-sm font-medium text-clinic-navy">{diagnosis || 'Not specified'}</p>
            </div>
          </div>

          {/* Medicines */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
              <Pill size={14} className="mr-1.5" /> Prescribed Medicines ({medicines.length})
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Medicine</th>
                    <th className="px-4 py-3 font-semibold">Dosage</th>
                    <th className="px-4 py-3 font-semibold">Frequency</th>
                    <th className="px-4 py-3 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {medicines.map((med, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-clinic-navy">{med.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {[med.dosage_form, med.strength].filter(Boolean).join(' ') || 'Standard'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{med.frequency}</td>
                      <td className="px-4 py-3 text-gray-600">{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes & Follow Up */}
          {(notes || followUpDate) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes && (
                <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50/30">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                    <FileText size={14} className="mr-1.5" /> Advice & Notes
                  </h3>
                  <p className="text-sm font-medium text-clinic-navy whitespace-pre-wrap">{notes}</p>
                </div>
              )}
              {followUpDate && (
                <div className="border border-gray-200 rounded-lg p-4 bg-emerald-50/30">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                    <CheckCircle size={14} className="mr-1.5" /> Follow-up
                  </h3>
                  <p className="text-sm font-bold text-clinic-emeraldDark">
                    {new Date(followUpDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Edit Prescription
          </button>
          <button 
            onClick={onConfirm}
            disabled={saving}
            className="bg-clinic-emerald hover:bg-clinic-emeraldDark text-white font-bold px-8 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center disabled:bg-emerald-300"
          >
            {saving ? (
              <><Activity className="animate-pulse mr-2" size={18}/> Generating...</>
            ) : (
              'Confirm & Generate Rx'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
