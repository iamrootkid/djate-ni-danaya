
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          description?: string;
          shop_id?: string;
          created_at: string;
          updated_at: string;
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
          image_url?: string;
          shop_id?: string;
          created_at: string;
          updated_at: string;
        };
      };
      sales: {
        Row: {
          id: string;
          customer_name: string;
          customer_phone?: string;
          total_amount: number;
          employee_id?: string;
          shop_id?: string;
          created_at: string;
          updated_at: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          customer_name: string;
          customer_phone?: string;
          sale_id: string;
          shop_id?: string;
          is_modified?: boolean;
          modification_reason?: string;
          new_total_amount?: number;
          created_at: string;
          updated_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          role: string;
          shop_id?: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
