
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
  Row: Sale;
  Insert: {
    id?: string;
    customer_name: string;
    customer_phone?: string | null;
    total_amount?: number;
    employee_id?: string | null;
    shop_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    customer_name?: string;
    customer_phone?: string | null;
    total_amount?: number;
    employee_id?: string | null;
    shop_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}

export interface SaleItemsTable {
  Row: SaleItem;
  Insert: {
    id?: string;
    sale_id: string;
    product_id: string;
    quantity: number;
    price_at_sale: number;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    sale_id?: string;
    product_id?: string;
    quantity?: number;
    price_at_sale?: number;
    created_at?: string;
    updated_at?: string;
  };
}

export interface InvoicesTable {
  Row: Invoice;
  Insert: {
    id?: string;
    sale_id: string;
    customer_name: string;
    customer_phone?: string | null;
    invoice_number: string;
    shop_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    sale_id?: string;
    customer_name?: string;
    customer_phone?: string | null;
    invoice_number?: string;
    shop_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}
