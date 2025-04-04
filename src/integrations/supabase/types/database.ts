
import { ReturnedItem } from "@/types/invoice";
import { InvoiceModification, StockSummary } from "./functions";

export interface Database {
  public: {
    Tables: {
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          customer_name: string;
          customer_phone?: string;
          created_at: string;
          updated_at: string;
          shop_id: string;
          sale_id: string;
          is_modified: boolean;
          modification_reason?: string;
          new_total_amount?: number;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          customer_name: string;
          customer_phone?: string;
          created_at?: string;
          updated_at?: string;
          shop_id: string;
          sale_id: string;
          is_modified?: boolean;
          modification_reason?: string;
          new_total_amount?: number;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          customer_name?: string;
          customer_phone?: string;
          created_at?: string;
          updated_at?: string;
          shop_id?: string;
          sale_id?: string;
          is_modified?: boolean;
          modification_reason?: string;
          new_total_amount?: number;
        };
      };
      // Add other tables as needed
    };
    Functions: {
      check_column_exists: {
        Args: { table_name: string; column_name: string };
        Returns: boolean;
      };
      generate_invoice_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_best_selling_products: {
        Args: { shop_id_param: string; start_date_param: string; end_date_param: string };
        Returns: Array<{ product_id: string; product_name: string; total_quantity: number; total_revenue: number }>;
      };
      get_stock_summary: {
        Args: { start_date: string; filter_type: string; shop_id: string; };
        Returns: StockSummary;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      create_invoice_modification: {
        Args: {
          invoice_id: string;
          modification_type: "price" | "return" | "other";
          new_amount: number;
          reason: string;
          modified_by: string;
          shop_id: string;
          created_at: string;
          returned_items?: ReturnedItem[] | null;
        };
        Returns: InvoiceModification;
      };
      get_invoice_modifications: {
        Args: { invoice_id_param: string };
        Returns: InvoiceModification[];
      };
    };
  };
};
