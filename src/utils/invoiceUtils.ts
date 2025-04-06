
import { ReturnedItem } from "@/types/invoice";
import { InvoiceModification, BestSellingProduct, StockSummary } from "@/integrations/supabase/types/functions";

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
    Args: { shop_id_param: string; start_date_param: string; end_date_param: string };
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

// Function required by invoiceService
export const applyDateFilter = (query: any, startDate: Date, endDate: Date) => {
  return query
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());
};

// Function required by invoiceService
export const processInvoiceData = (invoices: any[]) => {
  return invoices;
};

// Function required by checkout
export const generateInvoiceNumber = () => {
  return `INV-${Date.now()}`;
};
