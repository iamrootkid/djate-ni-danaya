
export interface StockSummary {
  total_income: number;
  total_expenses: number;
  stock_in: number;
  stock_out: number;
  profit: number;
}

export interface BestSellingProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface DatabaseFunctions {
  generate_invoice_number: {
    Args: Record<PropertyKey, never>;
    Returns: string;
  };
  get_best_selling_products: {
    Args: {
      shop_id: string;
    };
    Returns: BestSellingProduct[];
  };
  get_stock_summary: {
    Args: {
      start_date: string;
      filter_type: string;
      shop_id: string;
    };
    Returns: StockSummary;
  };
  is_admin: {
    Args: Record<PropertyKey, never>;
    Returns: boolean;
  };
  get_user_role: {
    Args: {
      user_id: string;
    };
    Returns: string;
  };
  handle_invoice_modification: {
    Args: {
      p_invoice_id: string;
      p_new_amount: number;
      p_return_reason: string;
      p_returned_items: any[];
    };
    Returns: null;
  };
  check_column_exists: {
    Args: {
      table_name: string;
      column_name: string;
    };
    Returns: boolean;
  };
}
