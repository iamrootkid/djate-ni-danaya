import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Expense, ExpenseType } from "@/types/expense";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { useEffect } from "react";
import { useShopId } from "./use-shop-id";

export const useExpenses = (
  filterType: "all" | "daily" | "monthly",
  dateRange: DateRange | undefined
) => {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();

  useEffect(() => {
    const channel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['expenses'] });
          queryClient.invalidateQueries({ queryKey: ['expenses-stats'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ["expenses", filterType, dateRange, shopId],
    queryFn: async () => {
      let query = supabase
        .from("expenses")
        .select(`
          *,
          profiles:employee_id (
            email,
            first_name,
            last_name
          )
        `)
        .eq('shop_id', shopId);

      if (filterType !== "all" && dateRange?.from) {
        if (filterType === "daily") {
          query = query
            .gte("date", startOfDay(dateRange.from).toISOString())
            .lte("date", endOfDay(dateRange.to || dateRange.from).toISOString());
        } else if (filterType === "monthly") {
          query = query
            .gte("date", startOfMonth(dateRange.from).toISOString())
            .lte("date", endOfMonth(dateRange.to || dateRange.from).toISOString());
        }
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      
      return data.map(expense => ({
        ...expense,
        type: expense.type as ExpenseType
      }));
    },
    enabled: !!shopId,
  });

  const invalidateExpensesQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  };

  return {
    expenses,
    isLoading,
    invalidateExpensesQueries
  };
};
