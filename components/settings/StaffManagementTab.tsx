'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Loader2, User } from 'lucide-react';

export default function StaffManagementTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', role: 'doctor', specialization: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(json => { if (json.data) setUsers(json.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Failed to add user');
      setShowAddModal(false);
      setFormData({ fullName: '', email: '', role: 'doctor', specialization: '', phone: '' });
      fetchUsers();
    } catch (err) {
      alert('Error adding user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-clinic-navy px-6 py-4 border-b border-clinic-border flex items-center justify-between">
          <div className="flex items-center">
            <Users className="text-clinic-emerald mr-2" size={20} />
            <h2 className="text-lg font-bold text-white">Staff Management</h2>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-clinic-emerald hover:bg-clinic-emeraldDark text-white text-sm font-bold py-1.5 px-4 rounded-lg flex items-center transition-colors">
            <Plus size={16} className="mr-1" /> Add Staff
          </button>
        </div>
        
        <div className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Loading staff...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No staff members found.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Role</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-clinic-navy flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3 font-bold">
                        {u.fullName.charAt(0)}
                      </div>
                      {u.fullName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'doctor' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-gray-600">{u.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-clinic-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-clinic-navy text-lg">Add Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                <input type="text" value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-clinic-emerald" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-clinic-emerald" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Role</label>
                  <select value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-clinic-emerald">
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone</label>
                  <input type="text" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-clinic-emerald" />
                </div>
              </div>
              {formData.role === 'doctor' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Specialization</label>
                  <input type="text" value={formData.specialization} onChange={e=>setFormData({...formData, specialization: e.target.value})} className="w-full border rounded p-2 text-sm outline-none focus:border-clinic-emerald" />
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
              <button onClick={()=>setShowAddModal(false)} className="px-4 py-2 font-bold text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={handleAddUser} disabled={saving || !formData.fullName || !formData.email} className="px-6 py-2 bg-clinic-emerald text-white font-bold rounded-lg disabled:opacity-50 flex items-center">
                {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : null} Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
