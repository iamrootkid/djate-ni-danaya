
export interface InvoiceModification {
  id: string;
  invoice_id: string;
  modification_type: string;
  new_amount: number;
  reason: string;
  created_at: string;
  modified_by: string;
  shop_id: string;
  returned_items?: any[] | null;
}

export interface DatabaseFunctions {
  check_column_exists: {
    Args: { table_name: string; column_name: string };
    Returns: boolean;
  };
  generate_invoice_number: {
    Args: { shop_id_param: string };
    Returns: string;
  };
  get_best_selling_products: {
    Args: { shop_id_param: string; start_date_param: string; end_date_param: string };
    Returns: { product_id: string; product_name: string; total_quantity: number; total_revenue: number }[];
  };
  get_stock_summary: {
    Args: { shop_id_param: string; start_date_param: string; end_date_param: string };
    Returns: { total_income: number; total_expenses: number; stock_in: number; stock_out: number; profit: number }[];
  };
  is_admin: {
    Args: Record<string, never>;
    Returns: boolean;
  };
  create_invoice_modification: {
    Args: {
      invoice_id: string;
      modification_type: string;
      new_amount: number;
      reason: string;
      modified_by: string;
      shop_id: string;
      created_at: string;
      returned_items: any[] | null;
    };
    Returns: undefined;
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
}
