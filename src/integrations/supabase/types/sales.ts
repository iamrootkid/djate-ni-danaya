
import { Json } from './auth';

export interface SalesTable {
  Row: {
    id: string;
    total_amount: number;
    payment_method: string;
    shop_id: string;
    employee_id: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    total_amount: number;
    payment_method: string;
    shop_id: string;
    employee_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    total_amount?: number;
    payment_method?: string;
    shop_id?: string;
    employee_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}

export interface SaleItemsTable {
  Row: {
    id: string;
    sale_id: string;
    product_id: string;
    quantity: number;
    price_at_sale: number;
    created_at: string;
    updated_at: string;
    returned_quantity: number;
  };
  Insert: {
    id?: string;
    sale_id: string;
    product_id: string;
    quantity: number;
    price_at_sale: number;
    created_at?: string;
    updated_at?: string;
    returned_quantity?: number;
  };
  Update: {
    id?: string;
    sale_id?: string;
    product_id?: string;
    quantity?: number;
    price_at_sale?: number;
    created_at?: string;
    updated_at?: string;
    returned_quantity?: number;
  };
}

export interface InvoicesTable {
  Row: {
    id: string;
    invoice_number: string;
    customer_name: string;
    customer_phone: string | null;
    sale_id: string;
    shop_id: string;
    created_at: string;
    updated_at: string;
    is_modified: boolean;
    modification_reason: string | null;
    new_total_amount: number | null;
  };
  Insert: {
    id?: string;
    invoice_number: string;
    customer_name: string;
    customer_phone?: string | null;
    sale_id: string;
    shop_id: string;
    created_at?: string;
    updated_at?: string;
    is_modified?: boolean;
    modification_reason?: string | null;
    new_total_amount?: number | null;
  };
  Update: {
    id?: string;
    invoice_number?: string;
    customer_name?: string;
    customer_phone?: string | null;
    sale_id?: string;
    shop_id?: string;
    created_at?: string;
    updated_at?: string;
    is_modified?: boolean;
    modification_reason?: string | null;
    new_total_amount?: number | null;
  };
}

export interface InvoiceModificationsTable {
  Row: {
    id: string;
    invoice_id: string;
    modification_type: string;
    new_amount: number | null;
    reason: string;
    modified_by: string | null;
    shop_id: string;
    created_at: string;
    returned_items: Json | null;
  };
  Insert: {
    id?: string;
    invoice_id: string;
    modification_type: string;
    new_amount?: number | null;
    reason: string;
    modified_by?: string | null;
    shop_id: string;
    created_at?: string;
    returned_items?: Json | null;
  };
  Update: {
    id?: string;
    invoice_id?: string;
    modification_type?: string;
    new_amount?: number | null;
    reason?: string;
    modified_by?: string | null;
    shop_id?: string;
    created_at?: string;
    returned_items?: Json | null;
  };
}
