'use client';

import React, { useEffect, useState } from 'react';
import { X, Layers, Copy, ChevronDown, ChevronUp, Loader2, Pill, ArrowLeft, Plus } from 'lucide-react';
import { PrescribedMedicine } from './PrescriptionCart';
import { TreatmentGroup } from './TreatmentGroupsUI';

export default function QuickTreatmentGroupsPanel({ 
  isOpen, 
  onClose, 
  onLoadTemplate 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (medicines: PrescribedMedicine[]) => void;
}) {
  const [templates, setTemplates] = useState<TreatmentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  // Synchronize browser history so mobile browser Back button / swipe back gesture closes the drawer smoothly
  useEffect(() => {
    if (!isOpen) return;

    // Push history state entry when panel opens
    window.history.pushState({ panel: 'treatment-groups' }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    // If the history state entry was pushed, pop it cleanly
    if (typeof window !== 'undefined' && window.history.state?.panel === 'treatment-groups') {
      window.history.back();
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/templates');
      const { data } = await res.json();
      setTemplates(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-clinic-navy/60 backdrop-blur-sm z-[60] transition-opacity"
        onClick={handleClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header with explicit Back button */}
        <div className="bg-clinic-navy px-4 sm:px-6 py-4 flex justify-between items-center border-b border-clinic-border shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleClose} 
              className="flex items-center text-xs font-bold text-white bg-white/10 hover:bg-white/20 active:bg-white/30 px-3 py-2 rounded-xl transition-all shadow-xs"
              title="Return to Prescription"
            >
              <ArrowLeft size={16} className="mr-1 text-clinic-emerald" />
              Back
            </button>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center">
              <Layers size={18} className="mr-2 text-clinic-emerald shrink-0" />
              Protocol Packs
            </h2>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-xl"
            title="Close Panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              <Loader2 className="animate-spin mr-2" size={18} /> Loading protocol packs...
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center text-sm text-gray-500 mt-10 p-6 border border-dashed border-gray-300 rounded-xl bg-white">
              <p className="font-semibold text-slate-700 mb-1">No protocol packs saved yet.</p>
              <p className="text-xs text-slate-400">Add medicines on the prescription screen and click "Save Cart as Pack" to create your first one!</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {templates.map((template) => {
                const isExpanded = expandedTemplateId === template.id;
                
                return (
                  <div key={template.id} className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                    {/* Template Header (always visible) */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                      <div className="flex-1 cursor-pointer pr-2" onClick={() => setExpandedTemplateId(isExpanded ? null : template.id)}>
                        <h3 className="font-bold text-clinic-navy text-base flex items-center leading-tight">
                          {template.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Pill size={12} className="mr-1 text-emerald-600" /> {template.items.length} medicines
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setExpandedTemplateId(isExpanded ? null : template.id)}
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                          title={isExpanded ? "Hide Details" : "View Details"}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        
                        <button
                          onClick={() => {
                            const medsToLoad = template.items.map(item => ({
                              id: Math.random().toString(36).substr(2, 9),
                              generic_id: item.generic_id,
                              brand_id: item.brand_id,
                              name: item.name,
                              dosage_form: item.dosage_form,
                              strength: item.strength,
                              route: item.route,
                              frequency: item.frequency || '',
                              duration: item.duration || '',
                              instructions: item.instructions || ''
                            }));
                            onLoadTemplate(medsToLoad);
                            handleClose();
                          }}
                          className="flex items-center text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl shadow-xs transition-colors"
                        >
                          <Plus size={14} className="mr-1 stroke-[3]" /> Apply Pack
                        </button>
                      </div>
                    </div>

                    {/* Template Details (Expanded state) */}
                    {isExpanded && (
                      <div className="p-4 bg-gray-50/70 space-y-2.5 border-t border-gray-100">
                        {template.items.map((item, idx) => (
                          <div key={idx} className="text-xs bg-white p-3 rounded-lg border border-gray-200/80 shadow-2xs">
                            <p className="font-bold text-slate-800">{item.name} <span className="text-slate-500 font-normal text-[11px] ml-1">{item.strength}</span></p>
                            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-slate-600 font-medium">
                              {item.frequency && <span className="flex items-center"><span className="text-slate-400 mr-1">Freq:</span><strong>{item.frequency}</strong></span>}
                              {item.duration && <span className="flex items-center"><span className="text-slate-400 mr-1">Dur:</span><strong>{item.duration}</strong></span>}
                            </div>
                            {item.instructions && (
                              <p className="text-[11px] text-slate-500 mt-1 italic">"{item.instructions}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mobile Sticky Bottom Action Bar */}
        <div className="p-3.5 bg-white border-t border-slate-200 shrink-0 sm:hidden">
          <button
            onClick={handleClose}
            className="w-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center transition-colors shadow-xs"
          >
            <ArrowLeft size={16} className="mr-2 text-slate-600" />
            Back to Prescription
          </button>
        </div>
      </div>
    </>
  );
}
