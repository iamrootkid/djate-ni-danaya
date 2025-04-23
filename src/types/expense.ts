
export type ExpenseType = 'salary' | 'commission' | 'utility' | 'shop_maintenance' | 'stock_purchase' | 'loan_shop' | 'other';

export interface Profile {
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export interface Expense {
  id: string;
  type: ExpenseType;
  amount: number;
  date: string;
  description?: string;
  employee_id?: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}
