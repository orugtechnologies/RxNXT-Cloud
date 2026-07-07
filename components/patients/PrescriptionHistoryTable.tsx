'use client';

import { useState } from 'react';
import { EncounterWithMedicines } from '@/types/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function PrescriptionHistoryTable({ encounters }: { encounters: EncounterWithMedicines[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Flatten medicines from all encounters
  const allMedicines = encounters.flatMap(enc => 
    (enc.medicines || []).map(med => ({
      ...med,
      visitDate: enc.created_at,
      encounterId: enc.id
    }))
  );

  const filteredMedicines = allMedicines.filter(med => 
    med.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search medicines..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Date Prescribed</TableHead>
              <TableHead>Medicine</TableHead>
              <TableHead>Dosage / Strength</TableHead>
              <TableHead>Regimen</TableHead>
              <TableHead>Instructions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedicines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  No medicines found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMedicines.map((med, index) => (
                <TableRow key={`${med.encounterId}-${med.id || index}`}>
                  <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                    {formatDate(med.visitDate)}
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">
                    {med.medicine_name}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {med.dosage_form} {med.strength}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                      {med.frequency} × {med.duration}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm max-w-[200px] truncate" title={med.instructions || ''}>
                    {med.instructions || '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
