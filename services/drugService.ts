export interface MedicineSearchResult {
  id: string;
  brand_id?: string;
  generic_id?: string;
  brand_name?: string;
  generic_name: string;
  dosage_form?: string;
  dosage_form_id?: string;
  strength?: string;
  strength_id?: string;
  route?: string;
  route_id?: string;
  match_score?: number;
  rank_weight?: number;
}

export const searchMedicines = async (
  searchTerm: string,
  clinicId?: string,
  doctorId?: string
): Promise<MedicineSearchResult[]> => {
  if (!searchTerm || searchTerm.length < 2) return [];

  const params = new URLSearchParams({ q: searchTerm });
  if (clinicId) params.append('clinicId', clinicId);
  if (doctorId) params.append('doctorId', doctorId);

  const res = await fetch(`/api/drugs/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch medicines');
  }

  const data = await res.json();
  return (data.results || data || []).map((d: any) => ({
    id: d.id,
    brand_name: d.brandName || d.brand_name,
    generic_name: d.genericName || d.generic_name,
    dosage_form: d.dosageForm || d.dosage_form,
    strength: d.strength,
    route: d.route,
    match_score: d.matchScore ?? 100,
    rank_weight: d.prescriptionCount ?? 0,
  }));
};

