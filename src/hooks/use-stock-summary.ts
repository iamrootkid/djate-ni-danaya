
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
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

        console.log("Stock summary:", summary);
        return {
          ...summary,
          recent_returns: 0  // Setting default value since we're not using this anymore
        };
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
    staleTime: 30000, // Keep data fresh for 30 seconds before refetching
  });
};
