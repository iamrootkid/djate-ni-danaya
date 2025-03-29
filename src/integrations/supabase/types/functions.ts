
export interface DatabaseFunctions {
  check_column_exists: {
    Args: {
      table_name: string;
      column_name: string;
    };
    Returns: boolean;
  };
  generate_invoice_number: {
    Args: {};
    Returns: string;
  };
  get_best_selling_products: {
    Args: {};
    Returns: {
      product_id: string;
      product_name: string;
      total_quantity: number;
      total_revenue: number;
    }[];
  };
  get_stock_summary: {
    Args: {};
    Returns: {
      total_income: number;
      total_expenses: number;
      stock_in: number;
      stock_out: number;
      profit: number;
    }[];
  };
  is_admin: {
    Args: {};
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
      returned_items: any;
    };
    Returns: Record<string, any>;
  };
  get_invoice_modifications: {
    Args: {
      invoice_id: string;
    };
    Returns: any[];
  };
}
