
export interface InvoiceData {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  created_at: string;
  total_amount: number;
  employee_email: string;
  is_modified?: boolean; // Made optional to match how it's used
  new_total_amount?: number;
  sale_id?: string;
  modification_reason?: string;
}

// Changed from Date objects to string literal type for DateFilter
export type DateFilter = "all" | "daily" | "yesterday" | "monthly";

export interface ReturnedItem {
  id: string;
  name: string;
  quantity: number;
  originalQuantity: number;
  price: number;
  selected?: boolean;
}

// Complete InvoiceModification type
export interface InvoiceModification {
  id: string;
  invoice_id: string;
  modification_type: "return" | "discount" | "price" | "other";
  new_amount: number | null;
  reason: string;
  created_at: string;
  modified_by: string;
  shop_id?: string;
  returned_items?: ReturnedItem[] | null;
  profiles?: {
    email: string;
  } | null;
}

// Add a type for UserRole
export type UserRole = "admin" | "employee" | "owner";

// Add an Invoice type that matches what's used in the hooks
export interface Invoice extends Omit<InvoiceData, 'is_modified'> {
  is_modified: boolean;
  sales?: {
    total_amount: number;
  };
  modification_reason?: string;
}
