
import { Json } from './auth';

export interface Sale {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  total_amount: number;
  employee_id: string | null;
  shop_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  price_at_sale: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  sale_id: string;
  customer_name: string;
  customer_phone: string | null; 
  invoice_number: string;
  shop_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesTable {
  Row: {
    id: string;
    customer_name: string;
    customer_phone: string | null;
    total_amount: number;
    created_at: string;
    updated_at: string;
    employee_id: string | null;
    shop_id: string | null;
  };
  Insert: {
    id?: string;
    customer_name: string;
    customer_phone?: string | null;
    total_amount?: number;
    created_at?: string;
    updated_at?: string;
    employee_id?: string | null;
    shop_id?: string | null;
  };
  Update: {
    id?: string;
    customer_name?: string;
    customer_phone?: string | null;
    total_amount?: number;
    created_at?: string;
    updated_at?: string;
    employee_id?: string | null;
    shop_id?: string | null;
  };
}

export interface SaleItemsTable {
  Row: {
    id: string;
    sale_id: string;
    product_id: string;
    quantity: number;
    returned_quantity?: number; // Added returned_quantity field
    price_at_sale: number;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    sale_id: string;
    product_id: string;
    quantity: number;
    returned_quantity?: number; // Added returned_quantity field
    price_at_sale: number;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    sale_id?: string;
    product_id?: string;
    quantity?: number;
    returned_quantity?: number; // Added returned_quantity field
    price_at_sale?: number;
    created_at?: string;
    updated_at?: string;
  };
}

export interface InvoicesTable {
  Row: {
    id: string;
    invoice_number: string;
    customer_name: string;
    customer_phone?: string | null;
    created_at: string;
    updated_at: string;
    sale_id: string;
    shop_id: string | null;
    is_modified?: boolean;
    modification_reason?: string;
    new_total_amount?: number;
  };
  Insert: {
    id?: string;
    invoice_number: string;
    customer_name: string;
    customer_phone?: string | null;
    created_at?: string;
    updated_at?: string;
    sale_id: string;
    shop_id?: string | null;
    is_modified?: boolean;
    modification_reason?: string;
    new_total_amount?: number;
  };
  Update: {
    id?: string;
    invoice_number?: string;
    customer_name?: string;
    customer_phone?: string | null;
    created_at?: string;
    updated_at?: string;
    sale_id?: string;
    shop_id?: string | null;
    is_modified?: boolean;
    modification_reason?: string;
    new_total_amount?: number;
  };
}

// Add the InvoiceModificationsTable type
export interface InvoiceModificationsTable {
  Row: {
    id: string;
    invoice_id: string;
    modification_type: "price" | "return" | "other";
    new_amount?: number;
    reason: string;
    modified_by: string;
    shop_id: string;
    created_at: string;
    returned_items?: any | null;
  };
  Insert: {
    id?: string;
    invoice_id: string;
    modification_type: "price" | "return" | "other";
    new_amount?: number;
    reason: string;
    modified_by: string;
    shop_id: string;
    created_at?: string;
    returned_items?: any | null;
  };
  Update: {
    id?: string;
    invoice_id?: string;
    modification_type?: "price" | "return" | "other";
    new_amount?: number;
    reason?: string;
    modified_by?: string;
    shop_id?: string;
    created_at?: string;
    returned_items?: any | null;
  };
}
