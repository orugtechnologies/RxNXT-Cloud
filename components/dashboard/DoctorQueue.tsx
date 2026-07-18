'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, User } from 'lucide-react';

export default function DoctorQueue({ queue }: { queue: any[] }) {
  const router = useRouter();

  if (!queue || queue.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center h-48">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <Clock className="text-slate-400" size={24} />
        </div>
        <h3 className="font-bold text-slate-800">Your Queue is Empty</h3>
        <p className="text-slate-500 text-sm mt-1">No patients are currently waiting to see you.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center">
          <Clock className="mr-2 text-clinic-emerald" size={18} />
          Waiting Room
          <span className="ml-3 bg-clinic-emerald text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {queue.length}
          </span>
        </h3>
      </div>
      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {queue.map((item) => (
          <div 
            key={item.id} 
            onClick={() => router.push(`/doctor/prescription?patientId=${item.patient_id}&queueId=${item.id}`)}
            className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 text-clinic-blue rounded-full flex items-center justify-center font-bold mr-4">
                {item.patient_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 group-hover:text-clinic-blue transition-colors">
                  {item.patient_name}
                </h4>
                <div className="flex items-center text-xs text-slate-500 mt-0.5 space-x-3">
                  <span>{item.patient_age}y • {item.patient_gender}</span>
                  {item.patient_phone && <span>{item.patient_phone}</span>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-500 block mb-1">
                Since {new Date(item.waiting_since).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button className="text-xs bg-white border border-slate-200 text-slate-600 hover:text-clinic-blue hover:border-clinic-blue font-semibold px-3 py-1 rounded-md transition-all">
                Consult Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
