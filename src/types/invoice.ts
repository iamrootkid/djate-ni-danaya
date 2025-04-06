
export interface InvoiceData {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  created_at: string;
  total_amount: number;
  employee_email: string;
  sale_id: string;
  is_modified?: boolean;
  new_total_amount?: number;
  sales?: {
    total_amount: number;
    employee?: {
      email: string;
    } | null;
  };
}

export interface InvoiceModification {
  id: string;
  invoice_id: string;
  modification_type: string;
  new_amount: number;
  reason: string;
  created_at: string;
  modified_by: string;
  shop_id: string;
  profiles?: {
    email: string;
  } | null;
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
  price: number;
}

export type DateFilter = "all" | "daily" | "monthly" | "yesterday";
