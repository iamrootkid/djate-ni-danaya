
export type UserRole = 'admin' | 'employee' | 'owner';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string | null;
  last_name?: string | null;
  shop_id?: string | null;
  created_at: string;
  updated_at: string;
}
