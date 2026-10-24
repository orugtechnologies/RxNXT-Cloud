'use client';

import React, { useEffect, useState } from 'react';
import { Zap, Pill, Plus, Layers, FolderOpen, Loader2, Sparkles, Check } from 'lucide-react';
import { PrescribedMedicine } from './PrescriptionCart';
import QuickTreatmentGroupsPanel from './QuickTreatmentGroupsPanel';

export interface TreatmentGroupItem {
  id?: string;
  drugId?: string;
  generic_id?: string;
  brand_id?: string;
  name: string;
  dosage_form?: string;
  strength?: string;
  route?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface TreatmentGroup {
  id: string;
  name: string;
  items: TreatmentGroupItem[];
}

interface ProtocolPacksBarProps {
  onLoadTemplate: (medicines: PrescribedMedicine[]) => void;
  onOpenSaveModal: () => void;
  cartCount: number;
  refreshKey?: number;
}


export const CURATED_PROTOCOL_PACKS: TreatmentGroup[] = [
  {
    id: 'pack-viral-fever',
    name: 'Viral Fever / Flu Pack',
    items: [
      { name: 'Dolo 650', dosage_form: 'Tablet', strength: '650mg', frequency: '1-0-1', duration: '3 days', instructions: 'After Food' },
      { name: 'Cetirizine 10mg', dosage_form: 'Tablet', strength: '10mg', frequency: '0-0-1', duration: '3 days', instructions: 'At Bedtime' },
      { name: 'Pantocid 40mg', dosage_form: 'Tablet', strength: '40mg', frequency: '1-0-0', duration: '3 days', instructions: 'Before Breakfast' },
    ]
  },
  {
    id: 'pack-uri-cough',
    name: 'URI / Cough & Cold',
    items: [
      { name: 'Augmentin 625 Duo', dosage_form: 'Tablet', strength: '625mg', frequency: '1-0-1', duration: '5 days', instructions: 'After Food' },
      { name: 'Montair-LC', dosage_form: 'Tablet', strength: '10mg', frequency: '0-0-1', duration: '5 days', instructions: 'At Bedtime' },
      { name: 'Ascoril D Plus Syrup', dosage_form: 'Syrup', strength: '100ml', frequency: '1-1-1', duration: '5 days', instructions: 'After Food' },
    ]
  },
  {
    id: 'pack-acute-gastro',
    name: 'Acute Gastroenteritis',
    items: [
      { name: 'Norflox-TZ', dosage_form: 'Tablet', strength: 'Standard', frequency: '1-0-1', duration: '3 days', instructions: 'After Food' },
      { name: 'ORS Sachet', dosage_form: 'Powder', strength: '1 Sachet', frequency: 'SOS', duration: '3 days', instructions: 'In 1L Water' },
      { name: 'Pantocid 40mg', dosage_form: 'Tablet', strength: '40mg', frequency: '1-0-0', duration: '3 days', instructions: 'Before Food' },
      { name: 'Voveran 50mg', dosage_form: 'Tablet', strength: '50mg', frequency: 'SOS', duration: '3 days', instructions: 'When Pain Occurs' },
    ]
  },
  {
    id: 'pack-gastritis-gerd',
    name: 'Gastritis & Acidity',
    items: [
      { name: 'Pantocid-DSR', dosage_form: 'Capsule', strength: '40mg', frequency: '1-0-0', duration: '5 days', instructions: 'Before Breakfast' },
      { name: 'Digene Gel', dosage_form: 'Gel', strength: '200ml', frequency: '1-1-1', duration: '5 days', instructions: 'After Meals' },
    ]
  },
  {
    id: 'pack-htn-starter',
    name: 'Hypertension Starter',
    items: [
      { name: 'Telmisartan 40mg', dosage_form: 'Tablet', strength: '40mg', frequency: '1-0-0', duration: '15 days', instructions: 'Morning After Food' },
      { name: 'Amlodipine 5mg', dosage_form: 'Tablet', strength: '5mg', frequency: '0-0-1', duration: '15 days', instructions: 'Night After Food' },
    ]
  },
  {
    id: 'pack-t2dm-starter',
    name: 'Type-2 Diabetes Starter',
    items: [
      { name: 'Metformin 500mg SR', dosage_form: 'Tablet', strength: '500mg', frequency: '1-0-1', duration: '30 days', instructions: 'After Meals' },
      { name: 'Glimepiride 1mg', dosage_form: 'Tablet', strength: '1mg', frequency: '1-0-0', duration: '30 days', instructions: 'Before Breakfast' },
    ]
  }
];

export default function ProtocolPacksBar({
  onLoadTemplate,
  onOpenSaveModal,
  cartCount,
  refreshKey = 0
}: ProtocolPacksBarProps) {
  const [templates, setTemplates] = useState<TreatmentGroup[]>([]);

  // Combined packs: User's saved templates first, followed by standard clinical curated packs
  const displayedPacks: TreatmentGroup[] = [
    ...templates,
    ...CURATED_PROTOCOL_PACKS.filter(cp => !templates.some(t => t.name.toLowerCase() === cp.name.toLowerCase()))
  ];
  const [loading, setLoading] = useState(true);
  const [activePackId, setActivePackId] = useState<string | null>(null);
  const [showAllPanel, setShowAllPanel] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [refreshKey]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const json = await res.json();
        setTemplates(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load protocol packs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPack = (template: TreatmentGroup) => {
    setActivePackId(template.id);

    const medsToLoad: PrescribedMedicine[] = template.items.map((item) => ({
      id: Math.random().toString(36).substring(2, 11),
      generic_id: item.generic_id || item.drugId,
      brand_id: item.brand_id || item.drugId,
      name: item.name,
      dosage_form: item.dosage_form || '',
      strength: item.strength || '',
      route: item.route || '',
      frequency: item.frequency || '1-0-1',
      duration: item.duration || '5 days',
      instructions: item.instructions || 'After Food'
    }));

    onLoadTemplate(medsToLoad);

    setTimeout(() => {
      setActivePackId(null);
    }, 1200);
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-blue-50/50 p-3.5 rounded-2xl border border-emerald-100/80 mb-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-600 text-white p-1 rounded-lg shadow-sm">
            <Zap size={14} className="fill-current" />
          </div>
          <h3 className="text-xs font-extrabold text-clinic-navy uppercase tracking-wider flex items-center">
            My Protocol Packs
            <span className="ml-2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              1-Click Fill
            </span>
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {cartCount > 0 && (
            <button
              onClick={onOpenSaveModal}
              className="flex items-center text-xs font-bold bg-white text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 px-2.5 py-1 rounded-lg transition-all shadow-xs"
              title="Save current cart medicines as a reusable protocol pack"
            >
              <Plus size={13} className="mr-1 stroke-[3]" />
              Save Cart as Pack
            </button>
          )}

          <button
            onClick={() => setShowAllPanel(true)}
            className="flex items-center text-xs font-semibold text-gray-500 hover:text-clinic-navy px-2 py-1 rounded-lg hover:bg-white/60 transition-colors"
          >
            <FolderOpen size={13} className="mr-1 text-gray-400" />
            All Packs ({displayedPacks.length})
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Packs Row */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        {loading ? (
          <div className="flex items-center text-xs text-gray-400 py-1.5 px-3">
            <Loader2 size={13} className="animate-spin mr-2 text-emerald-600" />
            Loading protocol packs...
          </div>
        ) : displayedPacks.length === 0 ? (
          <div className="flex items-center space-x-3 text-xs text-gray-500 py-1 px-2">
            <span className="italic">No saved protocol packs yet.</span>
            {cartCount > 0 ? (
              <button
                onClick={onOpenSaveModal}
                className="font-bold text-emerald-700 underline hover:text-emerald-800"
              >
                Save your first pack now
              </button>
            ) : (
              <span className="text-gray-400">Add medicines below and click "Save Cart as Pack"</span>
            )}
          </div>
        ) : (
          displayedPacks.map((template) => {
            const isActive = activePackId === template.id;

            return (
              <button
                key={template.id}
                onClick={() => handleApplyPack(template)}
                className={`flex-shrink-0 flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all transform active:scale-95 border ${
                  isActive
                    ? 'bg-[#dbeafe] text-[#1e40af] border-[#93c5fd] shadow-md ring-2 ring-[#93c5fd]'
                    : 'bg-white hover:bg-blue-50 text-slate-800 border-blue-200/80 shadow-xs hover:border-blue-400 group'
                }`}
              >
                {isActive ? (
                  <Check size={14} className="text-[#1e40af] animate-bounce stroke-[3]" />
                ) : (
                  <Sparkles size={14} className="text-emerald-500 group-hover:text-white transition-colors" />
                )}
                <span>{template.name}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                    isActive
                      ? 'bg-white text-[#1e40af] border border-[#93c5fd]'
                      : 'bg-blue-50 text-[#1e40af] group-hover:bg-blue-100'
                  }`}
                >
                  {template.items.length} meds
                </span>
              </button>
            );
          })
        )}
      </div>

      <QuickTreatmentGroupsPanel
        isOpen={showAllPanel}
        onClose={() => setShowAllPanel(false)}
        onLoadTemplate={onLoadTemplate}
      />
    </div>
  );
}
