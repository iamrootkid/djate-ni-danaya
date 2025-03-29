
export interface BestSellingProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface StockSummary {
  total_income: number;
  total_expenses: number;
  stock_in: number;
  stock_out: number;
  profit: number;
}

// Define all database functions in this interface
export interface DatabaseFunctions {
  check_column_exists: (args: { table_name: string; column_name: string }) => boolean;
  generate_invoice_number: () => string;
  get_best_selling_products: () => BestSellingProduct[];
  get_stock_summary: () => StockSummary[];
  is_admin: () => boolean;
  create_invoice_modification: (args: {
    invoice_id: string;
    modification_type: string;
    new_amount: number;
    reason: string;
    modified_by: string;
    shop_id: string;
    created_at: string;
    returned_items: any;
  }) => any;
  get_invoice_modifications: (args: { invoice_id: string }) => InvoiceModification[];
}

export interface InvoiceModification {
  id: string;
  invoice_id: string;
  modification_type: string;
  new_amount: number;
  reason: string;
  modified_by: string;
  created_at: string;
  shop_id: string;
  returned_items?: any;
  profiles?: {
    email: string;
  };
}
