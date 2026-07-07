// types/database.ts
// Centralized database row types for the entire RxNXT platform.
// All components and API routes import from here — no more scattered definitions.

// ==========================================
// CORE ENTITY TYPES
// ==========================================

export interface Clinic {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  name: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
}

export interface Encounter {
  id: string;
  clinic_id: string;
  doctor_id: string;
  patient_id: string;
  chief_complaint: string | null;
  diagnosis: string | null;
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
}

export interface Prescription {
  id: string;
  clinic_id: string;
  encounter_id: string;
  doctor_id: string;
  patient_id: string;
  created_at: string;
}

export interface PrescriptionMedicine {
  id: string;
  prescription_id: string;
  clinic_id: string;
  generic_id: string | null;
  brand_id: string | null;
  dosage_form: string | null;
  strength: string | null;
  route: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  created_at: string;
}

// ==========================================
// DRUG TYPES
// ==========================================

export interface MedicineSearchResult {
  brand_id: string | null;
  generic_id: string | null;
  brand_name: string | null;
  generic_name: string;
  dosage_form: string | null;
  dosage_form_id: string | null;
  strength: string | null;
  strength_id: string | null;
  route: string | null;
  route_id: string | null;
  match_score: number;
  rank_weight: number;
}

export interface PrescribedMedicine {
  id: string;
  generic_id?: string;
  brand_id?: string;
  name: string;
  dosage_form?: string;
  strength?: string;
  route?: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface TreatmentGroup {
  id: string;
  name: string;
  doctor_id: string;
  clinic_id: string;
  items: TreatmentGroupItem[];
  created_at: string;
}

export interface TreatmentGroupItem {
  id: string;
  template_id: string;
  generic_id: string | null;
  brand_id: string | null;
  dosage_form: string | null;
  strength: string | null;
  route: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  sort_order: number;
}

// ==========================================
// ENRICHED TYPES (JOINed / Computed)
// ==========================================

export interface EncounterWithMedicines extends Encounter {
  doctor_name: string | null;
  prescription_id: string | null;
  medicines: PrescriptionMedicineWithName[];
}

export interface PrescriptionMedicineWithName extends PrescriptionMedicine {
  medicine_name: string;
}

export interface RecentPrescription {
  id: string;
  created_at: string;
  patient_id: string;
  patient_name: string;
  patient_age: number | null;
  patient_gender: string | null;
  chief_complaint: string | null;
  diagnosis: string | null;
  follow_up_date: string | null;
  medicine_count: number;
}

export interface UpcomingFollowUp {
  encounter_id: string;
  follow_up_date: string;
  chief_complaint: string | null;
  diagnosis: string | null;
  visit_date: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string | null;
  patient_age: number | null;
  patient_gender: string | null;
  days_until: number;
}

export interface FrequentMedicine {
  medicine_id: string;
  medicine_name: string;
  dosage_form: string | null;
  strength: string | null;
  route: string | null;
  prescription_count: number;
}
