
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
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          stock: number
          category_id: string | null
          shop_id: string | null
          created_at: string
          updated_at: string
          image_url: string | null
          stock_quantity: number | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number
          stock?: number
          category_id?: string | null
          shop_id?: string | null
          created_at?: string
          updated_at?: string
          image_url?: string | null
          stock_quantity?: number | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          stock?: number
          category_id?: string | null
          shop_id?: string | null
          created_at?: string
          updated_at?: string
          image_url?: string | null
          stock_quantity?: number | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          shop_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          shop_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          shop_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          customer_name: string
          customer_phone: string | null
          employee_id: string | null
          shop_id: string | null
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_phone?: string | null
          employee_id?: string | null
          shop_id?: string | null
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_phone?: string | null
          employee_id?: string | null
          shop_id?: string | null
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          price_at_sale: number
          returned_quantity: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          price_at_sale: number
          returned_quantity?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          price_at_sale?: number
          returned_quantity?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          customer_name: string
          customer_phone: string | null
          created_at: string
          updated_at: string
          shop_id: string | null
          sale_id: string
          is_modified: boolean | null
          modification_reason: string | null
          new_total_amount: number | null
        }
        Insert: {
          id?: string
          invoice_number: string
          customer_name: string
          customer_phone?: string | null
          created_at?: string
          updated_at?: string
          shop_id?: string | null
          sale_id: string
          is_modified?: boolean | null
          modification_reason?: string | null
          new_total_amount?: number | null
        }
        Update: {
          id?: string
          invoice_number?: string
          customer_name?: string
          customer_phone?: string | null
          created_at?: string
          updated_at?: string
          shop_id?: string | null
          sale_id?: string
          is_modified?: boolean | null
          modification_reason?: string | null
          new_total_amount?: number | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          first_name: string | null
          last_name: string | null
          role: string
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          shop_id?: string | null
          updated_at?: string
        }
      }
      shops: {
        Row: {
          id: string
          name: string
          address: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
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
