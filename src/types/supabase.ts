
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      staff: {
        Row: {
          id: string
          created_at: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          role: string
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          id: string
          created_at?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          role?: string
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          role?: string
          shop_id?: string | null
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string
          shop_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          shop_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          shop_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 
