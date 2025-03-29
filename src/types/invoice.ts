
export interface InvoiceData {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  created_at: string;
  total_amount: number;
  sale_id: string;
  employee_email?: string;
}

export type DateFilter = "all" | "daily" | "monthly" | "yesterday";
