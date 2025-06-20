
import { useState } from "react";
import { ExpensesTable } from "./ExpensesTable";
import { ExportExpensesButton } from "./ExportExpensesButton";
import { ExpenseActionButton } from "./ExpenseActionButton";
import { Expense } from "@/types/expense";
import { DateRange } from "react-day-picker";
import { useExpenses } from "@/hooks/use-expenses";

interface ExpensesListProps {
  filterType: "all" | "daily" | "monthly";
  dateRange: DateRange | undefined;
}

export const ExpensesList = ({ filterType, dateRange }: ExpensesListProps) => {
  const { expenses, invalidateExpensesQueries } = useExpenses(filterType, dateRange);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [actionMode, setActionMode] = useState<"delete" | "edit">("delete");

  const handleActionSelect = (expense: Expense, mode: "edit" | "delete") => {
    setSelectedExpense(expense);
    setActionMode(mode);
  };

  const handleActionSuccess = () => {
    invalidateExpensesQueries();
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <ExportExpensesButton expenses={expenses} />
      </div>

      <div className="rounded-md border">
        <ExpensesTable
          expenses={expenses}
          onActionSelect={handleActionSelect}
        />
      </div>

      {selectedExpense && (
        <ExpenseActionButton
          expense={selectedExpense}
          action={actionMode}
          onSuccess={handleActionSuccess}
        />
      )}
    </>
  );
};
