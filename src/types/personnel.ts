export interface Agent {
  id: string;
  name: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountManager {
  id: string;
  name: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  account_manager_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SolutionManager {
  id: string;
  name: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryManager {
  id: string;
  name: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
