
import { ReturnedItem } from "@/types/invoice";

export interface InvoiceModification {
  id: string;
  invoice_id: string;
  modification_type: string;
  new_amount: number;
  reason: string;
  created_at: string;
  modified_by: string;
  shop_id: string;
  returned_items?: ReturnedItem[] | null;
  profiles?: {
    email: string;
  } | null;
}

export interface BestSellingProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface DatabaseFunctions {
  check_column_exists: {
    Args: { table_name: string; column_name: string };
    Returns: boolean;
  };
  generate_invoice_number: {
    Args: Record<string, never>;
    Returns: string;
  };
  get_best_selling_products: {
    Args: { 
      shop_id_param: string; 
      start_date_param: string | null; 
      end_date_param: string | null; 
    };
    Returns: BestSellingProduct[];
  };
  get_stock_summary: {
    Args: { 
      start_date: string; 
      filter_type: string; 
      shop_id: string;
    };
    Returns: StockSummary[];
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
}

export interface StockSummary {
  total_income: number;
  total_expenses: number;
  stock_in: number;
  stock_out: number;
  profit: number;
  recent_returns: number;
}
