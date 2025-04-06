export interface InvoiceData {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  created_at: string;
  total_amount: number;
  employee_email: string;
  is_modified?: boolean;
  new_total_amount?: number;
  sales?: {
    total_amount: number;
    employee?: {
      email: string;
    };
  };
}

export interface InvoiceModification {
  id: string;
  invoice_id: string;
  modification_type: string;
  new_amount: number;
  reason: string;
  created_at: string;
  returned_items?: Array<{
    id: string;
    name: string;
    quantity: number;
    originalQuantity: number;
    price: number;
  }>;
}

export interface ReturnedItem {
  id: string;
  name: string;
  quantity: number;
  originalQuantity: number;
  selected: boolean;
  price: number; // Added price property to fix the error
}

export type DateFilter = "all" | "daily" | "monthly" | "yesterday";

