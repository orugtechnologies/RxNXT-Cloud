'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, FlaskConical, Save, Loader2, Sparkles, Plus, Trash2 } from 'lucide-react';
import {
  LabTestTemplate,
  LabParameterResult,
  getTemplateForTest,
  evaluateParameterAbnormal,
  evaluateOverallAbnormal,
  ResultFlag,
} from '@/lib/labTemplates';

interface LabResultEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  testItem: {
    id: string;
    testName: string;
    category?: string;
    templateType?: string;
    results?: any;
    impression?: string;
    status: string;
    isAbnormal?: boolean;
    labOrder: {
      id: string;
      orderNumber: string;
      patient: {
        id: string;
        name: string;
        age?: number | string | null;
        gender?: string | null;
        phone?: string | null;
      };
      doctor?: {
        fullName: string;
      } | null;
    };
  } | null;
}

export default function LabResultEntryModal({
  isOpen,
  onClose,
  onSuccess,
  testItem,
}: LabResultEntryModalProps) {
  const [template, setTemplate] = useState<LabTestTemplate | null>(null);
  const [parameters, setParameters] = useState<LabParameterResult[]>([]);
  const [impression, setImpression] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!testItem) return;

    const tmpl = getTemplateForTest(testItem.testName);
    setTemplate(tmpl);

    // Initialize parameters
    let initialParams: LabParameterResult[] = [];

    // If existing saved results are present
    if (testItem.results && Array.isArray(testItem.results) && testItem.results.length > 0) {
      initialParams = testItem.results.map((r: any) => ({
        id: r.id || Math.random().toString(),
        name: r.name,
        value: r.value || '',
        unit: r.unit || '',
        referenceRange: r.referenceRange || '',
        isAbnormal: Boolean(r.isAbnormal),
        flag: (r.flag as ResultFlag) || 'NORMAL',
      }));
    } else {
      // Build from template definitions
      const gender = testItem.labOrder.patient.gender;
      initialParams = tmpl.parameters.map(p => {
        const defaultVal = p.defaultValue || '';
        const rangeStr = p.genderSpecific && gender
          ? (gender.toUpperCase().startsWith('M') ? p.genderSpecific.M.range : p.genderSpecific.F.range) + (p.unit ? ` ${p.unit}` : '')
          : (p.referenceRange || (p.min !== undefined && p.max !== undefined ? `${p.min} - ${p.max} ${p.unit}` : ''));

        const evalRes = evaluateParameterAbnormal(p, defaultVal, gender);

        return {
          id: p.id,
          name: p.name,
          value: defaultVal,
          unit: p.unit,
          referenceRange: rangeStr,
          isAbnormal: evalRes.isAbnormal,
          flag: evalRes.flag,
        };
      });
    }

    setParameters(initialParams);
    setImpression(testItem.impression || tmpl.defaultImpression || '');
    setError('');
  }, [testItem]);

  if (!isOpen || !testItem || !template) return null;

  const patient = testItem.labOrder.patient;
  const isOverallAbnormal = evaluateOverallAbnormal(parameters);

  const handleValueChange = (index: number, newValue: string) => {
    const updated = [...parameters];
    const item = updated[index];
    item.value = newValue;

    // Find matching definition to re-evaluate
    const def = template.parameters.find(p => p.id === item.id);
    if (def) {
      const evalRes = evaluateParameterAbnormal(def, newValue, patient.gender);
      item.isAbnormal = evalRes.isAbnormal;
      item.flag = evalRes.flag;
    } else {
      item.isAbnormal = false;
      item.flag = 'NORMAL';
    }

    setParameters(updated);
  };

  const handleAddCustomRow = () => {
    const newRow: LabParameterResult = {
      id: `custom_${Date.now()}`,
      name: '',
      value: '',
      unit: '',
      referenceRange: '',
      isAbnormal: false,
      flag: 'NORMAL',
    };
    setParameters([...parameters, newRow]);
  };

  const handleRemoveCustomRow = (index: number) => {
    setParameters(parameters.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/lab/results/${testItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results: parameters,
          impression,
          technicianName: technicianName.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to save test results');
      }

      const data = await res.json();
      if (data.queueUpdated) {
        // Patient queue was transitioned to RETURNED_READY
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving lab results:', err);
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-50/90 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
              <FlaskConical size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {testItem.testName}
                </h3>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  {template.type} Template
                </span>
                {isOverallAbnormal && (
                  <span className="text-[11px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Abnormal Flags
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Patient: <strong className="text-slate-800">{patient.name}</strong> •{' '}
                {patient.age ? `${patient.age}Y` : ''} {patient.gender ? `(${patient.gender})` : ''} • Order:{' '}
                <span className="font-mono text-slate-700">{testItem.labOrder.orderNumber}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Parameter Worktable */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Table Header */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="bg-slate-100/80 px-4 py-2.5 grid grid-cols-12 gap-3 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <div className="col-span-4 sm:col-span-5">Test Parameter</div>
              <div className="col-span-4 sm:col-span-3">Observed Value</div>
              <div className="col-span-2 hidden sm:block">Unit</div>
              <div className="col-span-4 sm:col-span-2 text-right">Reference Range</div>
            </div>

            <div className="divide-y divide-slate-100 bg-white">
              {parameters.map((param, idx) => {
                const def = template.parameters.find(p => p.id === param.id);

                return (
                  <div
                    key={param.id || idx}
                    className={`px-4 py-2.5 grid grid-cols-12 gap-3 items-center text-xs transition-colors ${
                      param.isAbnormal ? 'bg-red-50/50' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Parameter Name */}
                    <div className="col-span-4 sm:col-span-5">
                      {def ? (
                        <span className="font-semibold text-slate-800">{param.name}</span>
                      ) : (
                        <input
                          type="text"
                          value={param.name}
                          onChange={e => {
                            const updated = [...parameters];
                            updated[idx].name = e.target.value;
                            setParameters(updated);
                          }}
                          placeholder="Parameter name..."
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs"
                        />
                      )}
                    </div>

                    {/* Value Input */}
                    <div className="col-span-4 sm:col-span-3">
                      <div className="flex items-center gap-1.5">
                        {def?.type === 'select' && def.options ? (
                          <select
                            value={param.value}
                            onChange={e => handleValueChange(idx, e.target.value)}
                            className={`w-full text-xs rounded-lg px-2.5 py-1.5 border font-semibold outline-none transition-all ${
                              param.isAbnormal
                                ? 'bg-red-50 border-red-300 text-red-900 font-bold focus:ring-2 focus:ring-red-400'
                                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500'
                            }`}
                          >
                            {def.options.map(opt => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            inputMode={def?.type === 'number' ? 'decimal' : undefined}
                            value={param.value}
                            onChange={e => handleValueChange(idx, e.target.value)}
                            placeholder="Enter value"
                            className={`w-full text-xs rounded-lg px-2.5 py-1.5 border font-semibold outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                              param.isAbnormal
                                ? 'bg-red-50 border-red-300 text-red-900 font-bold focus:ring-2 focus:ring-red-400'
                                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500'
                            }`}
                          />
                        )}

                        {/* Abnormal Flag Badge */}
                        {param.isAbnormal && param.flag !== 'NORMAL' && (
                          <span className="shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                            {param.flag}
                          </span>
                        )}

                        {!def && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomRow(idx)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Unit */}
                    <div className="col-span-2 hidden sm:block text-slate-500 font-medium">
                      {def ? (
                        param.unit || '-'
                      ) : (
                        <input
                          type="text"
                          value={param.unit}
                          onChange={e => {
                            const updated = [...parameters];
                            updated[idx].unit = e.target.value;
                            setParameters(updated);
                          }}
                          placeholder="unit"
                          className="w-16 bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs"
                        />
                      )}
                    </div>

                    {/* Reference Range */}
                    <div className="col-span-4 sm:col-span-2 text-right text-slate-400 font-mono text-[11px]">
                      {def ? (
                        param.referenceRange || '-'
                      ) : (
                        <input
                          type="text"
                          value={param.referenceRange}
                          onChange={e => {
                            const updated = [...parameters];
                            updated[idx].referenceRange = e.target.value;
                            setParameters(updated);
                          }}
                          placeholder="ref range"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs text-right"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add custom parameter button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddCustomRow}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
            >
              <Plus size={13} /> Add Custom Field
            </button>
          </div>

          {/* Impression / Clinical Interpretation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Clinical Impression / Remarks
            </label>
            <textarea
              value={impression}
              onChange={e => setImpression(e.target.value)}
              rows={2}
              placeholder="Summary impression, diagnostic interpretation, or note to doctor..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Technician Signatory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Verified By (Technician Name)
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={e => setTechnicianName(e.target.value)}
                placeholder="e.g. Ramesh Kumar, B.Sc MLT"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="bg-blue-50/60 border border-blue-200/70 rounded-xl p-3 text-xs text-blue-900 flex items-center gap-2.5">
              <Sparkles size={18} className="text-blue-600 shrink-0" />
              <div>
                <span className="font-bold">Automatic Queue Handoff:</span>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Saving this report will immediately transition the patient's queue to <strong>"Reports Ready"</strong> on the doctor's screen.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {saving ? 'Saving Report...' : 'Verify & Complete Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
