// types/auth.ts
// Authentication and RBAC type definitions

export type UserRole = 'super_admin' | 'clinic_admin' | 'doctor';

export interface UserProfile {
  id: string;
  user_id: string;
  clinic_id: string;
  role: UserRole;
  full_name: string;
  specialization: string | null;
  registration_number: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  clinic_id: string;
}

export interface SessionUser {
  id: string;
  email: string;
  user_metadata: {
    clinic_id: string;
    role: UserRole;
    full_name?: string;
  };
}

// Role-based dashboard redirect paths
export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  super_admin: '/admin/dashboard',
  clinic_admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
};

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/api/health',
  '/api/auth/callback',
  '/api/auth/register',
];
