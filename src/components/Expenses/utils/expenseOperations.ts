
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];

export const fetchExpenses = async (shopId: string): Promise<Expense[]> => {
  if (!shopId) {
    console.warn("No shop ID provided for fetching expenses");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("shop_id", shopId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchExpenses:", error);
    return [];
  }
};

export const createExpense = async (
  expenseData: Omit<ExpenseInsert, "shop_id">,
  shopId: string
): Promise<Expense> => {
  if (!shopId) {
    throw new Error("Shop ID is required for creating an expense");
  }

  try {
    const { data, error } = await supabase
      .from("expenses")
      .insert([{ ...expenseData, shop_id: shopId }])
      .select()
      .single();

    if (error) {
      console.error("Error creating expense:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No data returned from expense creation");
    }

    return data;
  } catch (error) {
    console.error("Error in createExpense:", error);
    throw error;
  }
};

export const updateExpense = async (
  expenseId: string,
  expenseData: Partial<Omit<ExpenseInsert, "shop_id">>,
  shopId: string
): Promise<Expense> => {
  if (!shopId) {
    throw new Error("Shop ID is required for updating an expense");
  }

  try {
    const { data, error } = await supabase
      .from("expenses")
      .update(expenseData)
      .eq("id", expenseId)
      .eq("shop_id", shopId)
      .select()
      .single();

    if (error) {
      console.error("Error updating expense:", error);
      throw error;
    }

    if (!data) {
      throw new Error("No data returned from expense update");
    }

    return data;
  } catch (error) {
    console.error("Error in updateExpense:", error);
    throw error;
  }
};

export const deleteExpense = async (expenseId: string, shopId: string): Promise<void> => {
  if (!shopId) {
    throw new Error("Shop ID is required for deleting an expense");
  }

  try {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("shop_id", shopId);

    if (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteExpense:", error);
    throw error;
  }
};
