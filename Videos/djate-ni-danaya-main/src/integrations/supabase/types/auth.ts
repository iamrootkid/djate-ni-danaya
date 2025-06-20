
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  shop_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfilesTable {
  Row: Profile;
  Insert: {
    id: string;
    email: string;
    role?: string;
    shop_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    email?: string;
    role?: string;
    shop_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}
