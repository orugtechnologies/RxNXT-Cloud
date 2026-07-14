'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Upload, FileUp } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export default function ClinicDrugsPage() {
  const [drugs, setDrugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newDrug, setNewDrug] = useState({
    genericName: '',
    brandName: '',
    dosageForm: '',
    strength: '',
    route: '',
    aliases: ''
  });

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      const res = await fetch('/api/drugs/clinic');
      const json = await res.json();
      if (json.data) setDrugs(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/drugs/clinic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDrug)
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewDrug({ genericName: '', brandName: '', dosageForm: '', strength: '', route: '', aliases: '' });
        fetchDrugs();
      } else {
        const json = await res.json();
        alert(json.error || 'Failed to add drug');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while adding the drug.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom drug?')) return;
    try {
      const res = await fetch(`/api/drugs/clinic?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDrugs();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim() !== '');
        
        if (lines.length < 2) {
          alert("CSV file seems empty or invalid.");
          setIsUploading(false);
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        
        const parsedDrugs = lines.slice(1).map(line => {
          // Regex to split by comma, ignoring commas inside quotes
          const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
          const obj: any = {};
          headers.forEach((h, i) => {
            if (values[i]) obj[h] = values[i];
          });
          return obj;
        });

        // Send to backend
        const res = await fetch('/api/drugs/clinic/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ drugs: parsedDrugs })
        });
        
        const json = await res.json();
        if (res.ok) {
          alert(`Successfully uploaded ${json.data.insertedCount} custom drugs!`);
          fetchDrugs();
        } else {
          alert(json.error || 'Failed to upload CSV');
        }
      } catch (error) {
        console.error("Error parsing CSV:", error);
        alert("Failed to parse CSV file.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,genericName,brandName,dosageForm,strength,route,aliases\nParacetamol,Dolo,Tablet,500mg,Oral,\"PCM, P-Mol\"\nAmoxicillin,Augmentin,Syrup,250mg,Oral,AMOX";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "rxnxt_custom_drugs_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            Clinic Drugs
            <InfoTooltip text="Manage your clinic's custom drug database. Add specific medicines, dosages, and brands that you frequently prescribe for faster access." />
          </h1>
          <p className="text-slate-500">Manage custom medicines for your clinic.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 border border-slate-300 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" /> {isUploading ? 'Uploading...' : 'Upload CSV'}
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-clinic-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-clinic-blue/90"
          >
            <Plus className="h-4 w-4" /> Add Custom Drug
          </button>
        </div>
      </div>

      <div className="mb-4">
         <button onClick={downloadTemplate} className="text-sm text-clinic-emerald hover:underline flex items-center gap-1">
            <FileUp className="h-3 w-3"/> Download CSV Template
         </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New Custom Drug</h2>
          <form onSubmit={handleAddDrug} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Generic Name *</label>
                <input required type="text" value={newDrug.genericName} onChange={e => setNewDrug({...newDrug, genericName: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. Paracetamol" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name</label>
                <input type="text" value={newDrug.brandName} onChange={e => setNewDrug({...newDrug, brandName: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. Dolo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dosage Form</label>
                <input type="text" value={newDrug.dosageForm} onChange={e => setNewDrug({...newDrug, dosageForm: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. Tablet" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Strength</label>
                <input type="text" value={newDrug.strength} onChange={e => setNewDrug({...newDrug, strength: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. 500mg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Route</label>
                <input type="text" value={newDrug.route} onChange={e => setNewDrug({...newDrug, route: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. Oral" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aliases</label>
                <input type="text" value={newDrug.aliases} onChange={e => setNewDrug({...newDrug, aliases: e.target.value})} className="w-full p-2 border rounded-md" placeholder="e.g. PCM, P-Mol" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-clinic-emerald text-white font-medium rounded-lg hover:bg-clinic-emerald/90">Save Drug</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading custom drugs...</div>
        ) : drugs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No custom drugs found. Click "Add Custom Drug" or upload a CSV to create one.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-medium">Brand / Generic Name</th>
                <th className="p-4 font-medium">Form &amp; Strength</th>
                <th className="p-4 font-medium">Route</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {drugs.map(drug => (
                <tr key={drug.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{drug.brandName || drug.genericName}</p>
                    {drug.brandName && <p className="text-xs text-slate-500">{drug.genericName}</p>}
                  </td>
                  <td className="p-4 text-slate-600">
                    {drug.dosageForm} {drug.strength}
                  </td>
                  <td className="p-4 text-slate-600">
                    {drug.route}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(drug.id)} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
