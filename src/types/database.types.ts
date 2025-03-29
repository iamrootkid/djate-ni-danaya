export interface Database {
  public: {
    Tables: {
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          returned_quantity: number;
          price_at_sale: number;
          created_at: string;
          updated_at: string;
          products: {
            name: string;
          };
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          stock_quantity: number;
          updated_at: string;
        };
      };
    };
    Functions: {
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
        Returns: string;
      };
      get_invoice_modifications: {
        Args: {
          invoice_id: string;
        };
        Returns: Array<{
          id: string;
          invoice_id: string;
          modification_type: string;
          new_amount: number;
          reason: string;
          modified_by: string;
          created_at: string;
          returned_items: any;
          profiles: {
            email: string;
            full_name: string;
          };
        }>;
      };
      check_column_exists: {
        Args: {
          p_table_name: string;
          p_column_name: string;
        };
        Returns: boolean;
      };
    };
  };
} 