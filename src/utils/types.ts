
import { Database } from "@/types/supabase";

export type Role = "admin" | "employee";

export type TableRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type TableInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

export type TableUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

export function isRole(value: string): value is Role {
  return value === "admin" || value === "employee";
}
