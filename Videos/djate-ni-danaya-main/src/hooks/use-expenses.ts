
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useShopId } from "./use-shop-id";
import { Expense } from "@/types/expense";

export const useExpenses = (
  filterType: "all" | "daily" | "monthly",
  dateRange?: DateRange
) => {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  
  const queryKey = ["expenses", shopId, filterType, dateRange?.from?.toString(), dateRange?.to?.toString()];

  const { data: expenses = [] } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!shopId) return [];
      
      let query = supabase
        .from("expenses")
        .select("*")
        .eq("shop_id", shopId);

      if (filterType === "daily" && dateRange?.from) {
        const formattedDate = format(dateRange.from, "yyyy-MM-dd");
        query = query.eq("date", formattedDate);
      } else if (filterType === "monthly" && dateRange?.from) {
        const year = dateRange.from.getFullYear();
        const month = dateRange.from.getMonth() + 1; // JavaScript months are 0-based
        
        // Calculate first and last day of the month
        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
        
        query = query.gte("date", startDate).lte("date", endDate);
      }

      const { data, error } = await query.order("date", { ascending: false });
      
      if (error) {
        console.error("Error fetching expenses:", error);
        throw error;
      }
      
      return data as Expense[];
    },
    enabled: !!shopId,
  });

  const invalidateExpensesQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
  };

  return {
    expenses,
    invalidateExpensesQueries,
  };
};
