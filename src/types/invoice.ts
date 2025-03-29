
export interface InvoiceData {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  created_at: string;
  total_amount: number;
  sale_id: string;
  employee_email?: string;
  is_modified?: boolean;
  modification_reason?: string;
  new_total_amount?: number;
}

export interface InvoiceModification {
  id: string;
  invoice_id: string;
  modification_type: "price" | "return" | "other";
  new_amount?: number;
  reason: string;
  modified_by: string;
  created_at: string;
  shop_id: string;
  returned_items?: ReturnedItem[] | null;
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
