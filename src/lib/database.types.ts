
// Create this file as it's missing but referenced in SalesStats.tsx

export type Database = {
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
      };
      sales: {
        Row: {
          id: string;
          total_amount: number;
          customer_name: string;
          customer_phone?: string;
          created_at: string;
          updated_at: string;
          shop_id: string;
          employee_id?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description?: string;
          price: number;
          stock: number;
          category_id?: string;
          shop_id: string;
          image_url?: string;
          created_at: string;
          updated_at: string;
        };
      };
      // Add more table definitions as needed
    };
  };
};
