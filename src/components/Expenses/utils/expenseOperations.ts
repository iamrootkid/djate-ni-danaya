
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
    .eq('shop_id', shopId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }

  return data || [];
};

export const createExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>, shopId: string): Promise<Expense> => {
  const expenseData = {
    ...expense,
    shop_id: shopId,
  };

  const { data, error } = await supabase
    .from('expenses')
    .insert([expenseData])
    .select()
    .single();

  if (error) {
    console.error('Error creating expense:', error);
    throw error;
  }

  return data;
};

export const updateExpense = async (id: string, expense: Partial<Omit<Expense, 'shop_id'>>, shopId: string): Promise<Expense> => {
  const { data, error } = await supabase
    .from('expenses')
    .update(expense)
    .eq('id', id)
    .eq('shop_id', shopId)
    .select()
    .single();

  if (error) {
    console.error('Error updating expense:', error);
    throw error;
  }

  return data;
};

export const deleteExpense = async (id: string, shopId: string): Promise<void> => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('shop_id', shopId);

  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};
