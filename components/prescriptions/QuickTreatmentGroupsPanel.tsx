'use client';

import React, { useEffect, useState } from 'react';
import { X, Layers, Copy, ChevronDown, ChevronUp, Loader2, Pill } from 'lucide-react';
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
        className="fixed inset-0 bg-clinic-navy/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel (approx quarter page size -> w-96) */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-clinic-navy px-6 py-5 flex justify-between items-center border-b border-clinic-border">
          <h2 className="text-lg font-bold text-white flex items-center">
            <Layers size={20} className="mr-2 text-clinic-emerald" />
            Quick Treatment Groups
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              <Loader2 className="animate-spin mr-2" size={18} /> Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center text-sm text-gray-500 mt-10 p-4 border border-dashed border-gray-300 rounded-xl bg-white">
              No groups saved yet. Add medicines below and click "Save as Group" to create one!
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => {
                const isExpanded = expandedTemplateId === template.id;
                
                return (
                  <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
                    {/* Template Header (always visible) */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
                      <div className="flex-1 cursor-pointer" onClick={() => setExpandedTemplateId(isExpanded ? null : template.id)}>
                        <h3 className="font-bold text-clinic-navy text-base flex items-center">
                          {template.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <Pill size={12} className="mr-1" /> {template.items.length} medicines
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setExpandedTemplateId(isExpanded ? null : template.id)}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"
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
                            onClose(); // Optional: close panel after cloning
                          }}
                          className="flex items-center text-xs font-bold bg-clinic-emerald/10 text-clinic-emeraldDark hover:bg-clinic-emerald hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Copy size={14} className="mr-1" /> Clone
                        </button>
                      </div>
                    </div>

                    {/* Template Details (Expanded state) */}
                    {isExpanded && (
                      <div className="p-4 bg-gray-50/50 space-y-3">
                        {template.items.map((item, idx) => (
                          <div key={idx} className="text-sm bg-white p-3 rounded border border-gray-100">
                            <p className="font-semibold text-gray-800">{item.name} <span className="text-gray-500 font-normal text-xs ml-1">{item.strength}</span></p>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                              {item.frequency && <span className="flex items-center"><span className="text-gray-400 mr-1">Freq:</span>{item.frequency}</span>}
                              {item.duration && <span className="flex items-center"><span className="text-gray-400 mr-1">Dur:</span>{item.duration}</span>}
                            </div>
                            {item.instructions && (
                              <p className="text-xs text-gray-500 mt-1 italic">"{item.instructions}"</p>
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
      </div>
    </>
  );
}
