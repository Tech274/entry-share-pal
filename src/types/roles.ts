export type AppRole = 'ops_engineer' | 'ops_lead' | 'finance' | 'admin';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export const ROLE_LABELS: Record<AppRole, string> = {
  ops_engineer: 'Ops Engineer',
  ops_lead: 'Ops Lead',
  finance: 'Finance',
  admin: 'Admin',
};

export const ROLE_COLORS: Record<AppRole, string> = {
  ops_engineer: 'bg-blue-100 text-blue-800',
  ops_lead: 'bg-purple-100 text-purple-800',
  finance: 'bg-green-100 text-green-800',
  admin: 'bg-red-100 text-red-800',
};
