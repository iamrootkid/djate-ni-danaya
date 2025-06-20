
import { supabase } from "@/integrations/supabase/client";

export interface Expense {
  id: string;
  amount: number;
  date: string;
  description: string | null;
  type: string;
  employee_id: string | null;
  supplier_id: string | null;
  shop_id: string;
  created_at: string;
  updated_at: string;
}

export const getExpenses = async (shopId: string): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('shop_id', shopId as any)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }

  return (data || []) as any as Expense[];
};

export const createExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>, shopId?: string): Promise<Expense> => {
  const currentShopId = shopId || localStorage.getItem('shopId');
  if (!currentShopId) throw new Error("Shop ID is required to create an expense.");

  const expenseData = {
    amount: expense.amount,
    date: expense.date,
    description: expense.description || null,
    type: expense.type,
    employee_id: expense.employee_id || null,
    supplier_id: expense.supplier_id || null,
    shop_id: currentShopId,
  };

  const { data, error } = await supabase
    .from('expenses')
    .insert([expenseData] as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating expense:', error);
    throw error;
  }

  return data as any as Expense;
};

export const updateExpense = async (id: string, expense: Partial<Omit<Expense, 'id' | 'shop_id' | 'created_at' | 'updated_at'>>, shopId?: string): Promise<Expense> => {
  const currentShopId = shopId || localStorage.getItem('shopId');
  if (!currentShopId) throw new Error("Shop ID is required to update an expense.");

  const updateData: any = {};
  
  if (expense.amount !== undefined) {
    updateData.amount = expense.amount;
  }
  if (expense.date !== undefined) {
    updateData.date = expense.date;
  }
  if (expense.description !== undefined) {
    updateData.description = expense.description;
  }
  if (expense.type !== undefined) {
    updateData.type = expense.type;
  }
  if (expense.employee_id !== undefined) {
    updateData.employee_id = expense.employee_id;
  }
  if (expense.supplier_id !== undefined) {
    updateData.supplier_id = expense.supplier_id;
  }

  const { data, error } = await supabase
    .from('expenses')
    .update(updateData)
    .eq('id', id as any)
    .eq('shop_id', currentShopId as any)
    .select()
    .single();

  if (error) {
    console.error('Error updating expense:', error);
    throw error;
  }

  return data as any as Expense;
};

export const deleteExpense = async (id: string, shopId?: string): Promise<void> => {
  const currentShopId = shopId || localStorage.getItem('shopId');
  if (!currentShopId) throw new Error("Shop ID is required to delete an expense.");
  
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id as any)
    .eq('shop_id', currentShopId as any);

  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

export const exportExpenseToCsv = (expenses: Expense[]) => {
  if (!expenses || expenses.length === 0) {
    return;
  }

  const header = Object.keys(expenses[0]).join(',');
  const csv = expenses.map(row => 
    Object.values(row).map(value => 
      `"${String(value ?? '').replace(/"/g, '""')}"`
    ).join(',')
  ).join('\n');

  const blob = new Blob([header + '\n' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "expenses.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
