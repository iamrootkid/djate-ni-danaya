
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { useShopId } from "@/hooks/use-shop-id";
import { StockSummary } from "@/integrations/supabase/types/functions";

export const useStockSummary = (date: Date = new Date(), filter: "daily" | "monthly" | "yesterday" = "daily") => {
  const { shopId } = useShopId();

  return useQuery<StockSummary>({
    queryKey: ["stock-summary", format(date, "yyyy-MM-dd"), filter, shopId],
    queryFn: async () => {
      if (!shopId) return {
        total_income: 0,
        total_expenses: 0,
        stock_in: 0,
        stock_out: 0,
        profit: 0,
        recent_returns: 0,
      };

      const dateStr = format(date, "yyyy-MM-dd");
      console.log(`Fetching stock summary for ${dateStr} with filter ${filter}`);

      try {
        // Call the Supabase function to get stock summary
        const { data, error } = await supabase
          .rpc("get_stock_summary", {
            start_date: dateStr,
            filter_type: filter,
            shop_id: shopId,
          });

        if (error) throw error;

        // Format the response
        const summary = Array.isArray(data) ? data[0] : data;
        
        if (!summary) {
          console.error("No stock summary data returned");
          return {
            total_income: 0,
            total_expenses: 0,
            stock_in: 0,
            stock_out: 0,
            profit: 0,
            recent_returns: 0,
          };
        }

        // Add recent returns count if needed
        const enhancedSummary = {
          ...summary,
          recent_returns: 0
        };

        if (filter === "daily") {
          // Get the start and end of today
          const dayStart = startOfDay(date).toISOString();
          const dayEnd = endOfDay(date).toISOString();

          const { count: returns } = await supabase
            .from("invoice_modifications")
            .select("*", { count: "exact", head: true })
            .eq("shop_id", shopId)
            .eq("modification_type", "return")
            .gte("created_at", dayStart)
            .lte("created_at", dayEnd);

          enhancedSummary.recent_returns = returns || 0;
        }

        console.log("Stock summary:", enhancedSummary);
        return enhancedSummary;
      } catch (error) {
        console.error("Error fetching stock summary:", error);
        return {
          total_income: 0,
          total_expenses: 0,
          stock_in: 0,
          stock_out: 0,
          profit: 0,
          recent_returns: 0,
        };
      }
    },
    enabled: !!shopId,
    refetchInterval: 60000, // Refetch every minute
  });
};
