export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string | null
          employee_id: string | null
          id: string
          shop_id: string | null
          type: Database["public"]["Enums"]["expense_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          description?: string | null
          employee_id?: string | null
          id?: string
          shop_id?: string | null
          type: Database["public"]["Enums"]["expense_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          employee_id?: string | null
          id?: string
          shop_id?: string | null
          type?: Database["public"]["Enums"]["expense_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_modifications: {
        Row: {
          created_at: string
          id: string
          invoice_id: string
          modification_type: string
          modified_by: string
          new_amount: number | null
          reason: string
          returned_items: Json | null
          shop_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id: string
          modification_type: string
          modified_by: string
          new_amount?: number | null
          reason: string
          returned_items?: Json | null
          shop_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string
          modification_type?: string
          modified_by?: string
          new_amount?: number | null
          reason?: string
          returned_items?: Json | null
          shop_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_modifications_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_modifications_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string | null
          id: string
          invoice_number: string
          is_modified: boolean | null
          modification_reason: string | null
          new_total_amount: number | null
          sale_id: string
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          invoice_number: string
          is_modified?: boolean | null
          modification_reason?: string | null
          new_total_amount?: number | null
          sale_id: string
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          invoice_number?: string
          is_modified?: boolean | null
          modification_reason?: string | null
          new_total_amount?: number | null
          sale_id?: string
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          shop_id: string | null
          stock: number
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number
          shop_id?: string | null
          stock?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          shop_id?: string | null
          stock?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          price_at_sale: number
          product_id: string
          quantity: number
          returned_quantity: number | null
          sale_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          price_at_sale: number
          product_id: string
          quantity: number
          returned_quantity?: number | null
          sale_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          price_at_sale?: number
          product_id?: string
          quantity?: number
          returned_quantity?: number | null
          sale_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_name: string
          customer_phone: string | null
          employee_id: string | null
          id: string
          shop_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          employee_id?: string | null
          id?: string
          shop_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          employee_id?: string | null
          id?: string
          shop_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          id: number
          key: string
          shop_id: string | null
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: number
          key: string
          shop_id?: string | null
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: number
          key?: string
          shop_id?: string | null
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          owner_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          role: string
          shop_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          role?: string
          shop_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          role?: string
          shop_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_column_exists: {
        Args: { table_name: string; column_name: string }
        Returns: boolean
      }
      create_invoice_modification: {
        Args: {
          invoice_id: string
          modification_type: string
          new_amount: number
          reason: string
          modified_by: string
          shop_id: string
          created_at: string
          returned_items: Json
        }
        Returns: Json
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_best_selling_products: {
        Args:
          | Record<PropertyKey, never>
          | { shop_id: string }
          | {
              shop_id_param: string
              start_date_param: string
              end_date_param: string
            }
        Returns: {
          product_id: string
          product_name: string
          total_quantity: number
          total_revenue: number
        }[]
      }
      get_stock_summary: {
        Args:
          | { start_date: string; filter_type: string }
          | { start_date: string; filter_type: string; shop_id: string }
          | { start_date: string; filter_type: string; shop_id: string }
        Returns: {
          total_income: number
          total_expenses: number
          stock_in: number
          stock_out: number
          profit: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      expense_type:
        | "salary"
        | "commission"
        | "utility"
        | "shop_maintenance"
        | "stock_purchase"
        | "loan_shop"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      expense_type: [
        "salary",
        "commission",
        "utility",
        "shop_maintenance",
        "stock_purchase",
        "loan_shop",
        "other",
      ],
    },
  },
} as const
