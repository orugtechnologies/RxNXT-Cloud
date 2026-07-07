import { supabase } from '../lib/supabase';

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
  match_score: number;
  rank_weight: number;
}

export const searchMedicines = async (
  searchTerm: string,
  clinicId?: string,
  doctorId?: string
): Promise<MedicineSearchResult[]> => {
  if (!searchTerm || searchTerm.length < 2) return [];

  const { data, error } = await supabase.rpc('search_medicines', {
    search_term: searchTerm,
    p_clinic_id: clinicId || null,
    p_doctor_id: doctorId || null,
  });

  if (error) {
    console.error('Error searching medicines:', error);
    throw new Error('Failed to fetch medicines');
  }

  return data as MedicineSearchResult[];
};

export const addDoctorFavorite = async (
  doctorId: string,
  brandId: string | null,
  genericId: string | null,
  defaultRoute?: string,
  defaultFreq?: string,
  defaultDuration?: string,
  defaultInstructions?: string
) => {
  const { data, error } = await supabase.from('doctor_favorites').insert({
    doctor_id: doctorId,
    brand_id: brandId,
    generic_id: genericId,
    default_route: defaultRoute,
    default_frequency: defaultFreq,
    default_duration: defaultDuration,
    default_instructions: defaultInstructions
  });

  if (error) throw error;
  return data;
};

export const addClinicPreference = async (
  clinicId: string,
  brandId: string | null,
  genericId: string | null,
  isPreferred: boolean = true
) => {
  const { data, error } = await supabase.from('clinic_preferences').insert({
    clinic_id: clinicId,
    brand_id: brandId,
    generic_id: genericId,
    is_preferred: isPreferred
  });

  if (error) throw error;
  return data;
};
