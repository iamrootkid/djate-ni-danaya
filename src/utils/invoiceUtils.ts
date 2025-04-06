
import { ReturnedItem } from "@/types/invoice";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth, startOfToday, endOfToday, startOfYesterday, endOfYesterday } from "date-fns";
import { DateFilter } from "@/types/invoice";

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
  };
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
      start_date_param: string; 
      end_date_param: string 
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
  recent_returns?: number;
}

// Add the missing functions
export const generateInvoiceNumber = async (shopId: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('generate_invoice_number');
    
    if (error) {
      console.error("Error generating invoice number:", error);
      // Fallback to timestamp-based invoice number
      return `INV-${Date.now()}-${shopId.substring(0, 4)}`;
    }
    
    return data;
  } catch (error) {
    console.error("Error in generateInvoiceNumber:", error);
    // Fallback to timestamp-based invoice number
    return `INV-${Date.now()}-${shopId.substring(0, 4)}`;
  }
};

// Helper function to apply date filters to queries
export const applyDateFilter = (query: any, dateFilter: DateFilter, startDate: Date) => {
  const today = new Date();
  
  switch (dateFilter) {
    case "daily":
      const date = startDate || today;
      const dateString = format(date, "yyyy-MM-dd");
      return query.gte("created_at", `${dateString}T00:00:00`).lte("created_at", `${dateString}T23:59:59`);
    
    case "monthly":
      const monthStartDate = startOfMonth(startDate || today);
      const monthEndDate = endOfMonth(startDate || today);
      return query.gte("created_at", format(monthStartDate, "yyyy-MM-dd")).lte("created_at", format(monthEndDate, "yyyy-MM-dd"));
    
    case "yesterday":
      const yesterdayStart = startOfYesterday();
      const yesterdayEnd = endOfYesterday();
      return query.gte("created_at", format(yesterdayStart, "yyyy-MM-dd")).lte("created_at", format(yesterdayEnd, "yyyy-MM-dd"));
    
    default: // "all"
      return query;
  }
};

// Helper function to process invoice data
export const processInvoiceData = (data: any[], shopId: string): any[] => {
  return data.map(invoice => ({
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    customer_name: invoice.customer_name,
    customer_phone: invoice.customer_phone || "",
    created_at: invoice.created_at,
    total_amount: invoice.sales?.total_amount || 0,
    employee_email: invoice.sales?.employee?.email || "",
    is_modified: invoice.is_modified || false,
    new_total_amount: invoice.new_total_amount
  }));
};
