'use client';

import React from 'react';
import { X, Printer, Download, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { generateLabReportPDF, LabReportPDFData } from '@/lib/labReportPdfGenerator';
import { LabParameterResult } from '@/lib/labTemplates';

interface LabReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: {
    orderNumber: string;
    orderDate?: string;
    clinicName?: string;
    clinicAddress?: string;
    clinicPhone?: string;
    patient: {
      name: string;
      age?: number | string | null;
      gender?: string | null;
      phone?: string | null;
    };
    doctorName?: string;
    technicianName?: string;
    testName: string;
    category?: string;
    results: LabParameterResult[];
    impression?: string;
    isAbnormal?: boolean;
    completedAt?: string;
  } | null;
}

export default function LabReportViewerModal({
  isOpen,
  onClose,
  reportData,
}: LabReportViewerModalProps) {
  if (!isOpen || !reportData) return null;

  const handleDownloadPdf = () => {
    generateLabReportPDF({
      orderNumber: reportData.orderNumber,
      orderDate: reportData.orderDate || reportData.completedAt,
      clinicName: reportData.clinicName,
      clinicAddress: reportData.clinicAddress,
      clinicPhone: reportData.clinicPhone,
      patient: reportData.patient,
      doctorName: reportData.doctorName,
      technicianName: reportData.technicianName,
      testName: reportData.testName,
      category: reportData.category,
      results: reportData.results,
      impression: reportData.impression,
    }, false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText size={18} className="text-blue-400" />
            <h3 className="text-sm sm:text-base font-bold">Diagnostic Investigation Report</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Paper Document Preview */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-50 flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            {/* Clinic Letterhead */}
            <div className="border-b-2 border-blue-600 pb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  {reportData.clinicName || 'RxNXT Clinical Diagnostic Center'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {[reportData.clinicAddress, reportData.clinicPhone ? `Tel: ${reportData.clinicPhone}` : ''].filter(Boolean).join(' | ') || 'Diagnostic Pathology & Imaging Services'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-black tracking-wider text-blue-700 uppercase bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                  LABORATORY REPORT
                </span>
                <p className="text-[11px] font-mono text-slate-500 mt-1">
                  ID: {reportData.orderNumber}
                </p>
              </div>
            </div>

            {/* Patient & Order Details Strip */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Patient Name</span>
                <strong className="text-slate-800 text-sm">{reportData.patient.name}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Age / Sex</span>
                <span className="text-slate-700 font-medium">
                  {reportData.patient.age ? `${reportData.patient.age} Yrs` : '-'} / {reportData.patient.gender || '-'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Referred By</span>
                <span className="text-slate-700 font-medium">{reportData.doctorName || 'OPD Doctor'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Reported At</span>
                <span className="text-slate-700 font-medium">
                  {reportData.completedAt ? new Date(reportData.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Today'}
                </span>
              </div>
            </div>

            {/* Test Title */}
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
                {reportData.testName}
              </h2>
              {reportData.isAbnormal && (
                <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Abnormal Result
                </span>
              )}
            </div>

            {/* Results Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Test Parameter</th>
                    <th className="py-2 px-3">Observed Value</th>
                    <th className="py-2 px-3">Unit</th>
                    <th className="py-2 px-3 text-right">Reference Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportData.results.map((res, idx) => (
                    <tr
                      key={idx}
                      className={res.isAbnormal ? 'bg-red-50/50 font-semibold' : idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}
                    >
                      <td className="py-2 px-3 text-slate-800">{res.name}</td>
                      <td className="py-2 px-3">
                        <span className={res.isAbnormal ? 'text-red-700 font-bold' : 'text-slate-900'}>
                          {res.value || '-'}
                        </span>
                        {res.isAbnormal && res.flag && res.flag !== 'NORMAL' && (
                          <span className="ml-1.5 text-[10px] font-extrabold text-red-600 bg-red-100 px-1 py-0.2 rounded">
                            {res.flag}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-500">{res.unit || '-'}</td>
                      <td className="py-2 px-3 text-slate-400 font-mono text-right">{res.referenceRange || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Clinical Impression */}
            {reportData.impression && (
              <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Impression / Interpretation
                </span>
                <p className="text-xs text-slate-800 whitespace-pre-wrap">{reportData.impression}</p>
              </div>
            )}

            {/* Signatory Footer */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] text-slate-400">
                RxNXT Digital Verification • Valid without physical signature
              </span>
              <div className="text-right">
                <strong className="text-slate-800 block">
                  {reportData.technicianName || 'Medical Lab Technologist'}
                </strong>
                <span className="text-[10px] text-slate-400">Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
