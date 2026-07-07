// types/api.ts
// API request/response type definitions

import type {
  RecentPrescription,
  UpcomingFollowUp,
  FrequentMedicine,
  Patient,
  EncounterWithMedicines,
} from './database';

// ==========================================
// DASHBOARD
// ==========================================

export interface DashboardStats {
  total_patients: number;
  today_patients: number;
  total_prescriptions: number;
  prescriptions_today: number;
  follow_ups_due: number;
  recent_activity: Array<{
    id: string;
    chief_complaint: string | null;
    diagnosis: string | null;
    created_at: string;
    patient_name: string;
  }>;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentPrescriptions: RecentPrescription[];
  followUps: UpcomingFollowUp[];
  frequentMedicines: FrequentMedicine[];
}

// ==========================================
// PATIENT HISTORY
// ==========================================

export interface PatientHistoryResponse {
  patient: Patient;
  encounters: EncounterWithMedicines[];
}

// ==========================================
// PRESCRIPTIONS
// ==========================================

export interface PrescriptionListResponse {
  prescriptions: RecentPrescription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClonePrescriptionRequest {
  sourcePrescriptionId: string;
  targetPatientId?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  notes?: string;
  followUpDate?: string;
  medicines?: Array<{
    generic_id?: string;
    brand_id?: string;
    dosage_form?: string;
    strength?: string;
    route?: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
}

export interface ClonePrescriptionResponse {
  encounter_id: string;
  prescription_id: string;
  patient_id: string;
  medicines_copied: number;
}

// ==========================================
// PAGINATION
// ==========================================

export interface PaginationParams {
  page: number;
  limit: number;
}

// ==========================================
// API ERROR
// ==========================================

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}

// ==========================================
// REGISTRATION
// ==========================================

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  clinicName: string;
  specialization?: string;
  registrationNumber?: string;
  phone?: string;
}

export interface RegisterResponse {
  clinicId: string;
  userId: string;
  message: string;
}
