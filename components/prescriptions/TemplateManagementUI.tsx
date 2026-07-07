'use client';

import React, { useEffect, useState } from 'react';
import { Layers, Loader2, Trash2, Pill, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { TreatmentGroup } from './TreatmentGroupsUI';

export default function TemplateManagementUI() {
  const [templates, setTemplates] = useState<TreatmentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const { data } = await res.json();
        setTemplates(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the treatment group "${name}"?`)) return;

    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates(templates.filter(t => t.id !== id));
      } else {
        alert('Failed to delete template');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting template');
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.items.some((i: any) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Layers className="text-clinic-emerald mr-3" size={28} strokeWidth={2.5} />
            Treatment Groups
          </h1>
          <p className="text-slate-500 mt-1 ml-11 text-sm font-medium">Manage your saved prescription templates</p>
        </div>
        
        <Link 
          href="/doctor/prescription"
          className="bg-clinic-emerald hover:bg-clinic-emeraldDark text-white font-bold py-2.5 px-5 rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center whitespace-nowrap"
        >
          <Plus size={18} className="mr-2" />
          Create New Group
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-clinic-border overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search groups or medicines..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-clinic-emerald/50 focus:border-clinic-emerald"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading treatment groups...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Layers className="mx-auto mb-4 text-gray-300" size={48} />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No groups found</h3>
            <p className="text-sm">
              {searchQuery ? "No groups match your search." : "You haven't saved any treatment groups yet."}
            </p>
            {!searchQuery && (
              <p className="text-sm mt-4">
                To create one, start a new prescription, add medicines, and click <b>"Save as Group"</b>.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTemplates.map(template => (
              <div key={template.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-clinic-navy">{template.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{template.items.length} medicines</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(template.id, template.name)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete group"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {template.items.map((item: any) => (
                    <div key={item.id} className="bg-white border border-gray-100 rounded-lg p-3 flex items-start shadow-sm">
                      <div className="bg-blue-50 p-1.5 rounded text-blue-500 mr-3 shrink-0 mt-0.5">
                        <Pill size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate" title={item.name}>{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {item.dosage_form && <span className="mr-1">{item.dosage_form}</span>}
                          {item.strength}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1 truncate">
                          {item.frequency} {item.duration ? `• ${item.duration}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
