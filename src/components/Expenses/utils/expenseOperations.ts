
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExpenseType } from "@/types/expense";
import { filterByUUID, asUUID } from "@/utils/supabaseHelpers";

interface ExpenseUpdateData {
  amount: number;
  description: string;
  type: ExpenseType;
}

export const deleteExpense = async (expenseId: string) => {
  try {
    // Use proper UUID handling for the ID parameter
    const { error } = await supabase
      .from("expenses")
      .delete()
      .match(filterByUUID("id", expenseId));

    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

export const updateExpense = async (
  expenseId: string,
  data: ExpenseUpdateData
) => {
  try {
    // Cast the expense type correctly for Supabase
    const updateData: any = {
      amount: data.amount,
      description: data.description
    };
    // Only add type if it's valid
    if (data.type) {
      updateData.type = data.type;
    }

    const { error } = await supabase
      .from("expenses")
      .update(updateData)
      .match(filterByUUID("id", expenseId));

    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating expense:", error);
    throw error;
  }
};

export const exportExpenseToCsv = (expense: any) => {
  // Convert expense object to CSV
  const headers = ["Date", "Type", "Amount", "Description"];
  const data = [
    expense.date,
    expense.type,
    expense.amount,
    expense.description || ""
  ];

  const csvContent = [
    headers.join(","),
    data.join(",")
  ].join("\n");

  // Create a blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `expense_${expense.id}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
