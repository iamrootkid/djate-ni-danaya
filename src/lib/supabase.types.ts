export type SupabaseFunctions = {
  check_column_exists: (args: { table_name: string; column_name: string }) => boolean;
  generate_invoice_number: (args: { shop_id: string }) => string;
  get_best_selling_products: (args: { shop_id: string; limit?: number }) => any[];
  get_stock_summary: (args: { shop_id: string }) => any[];
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
  }) => string;
}; 