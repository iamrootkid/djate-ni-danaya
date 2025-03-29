
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { StockSummary } from "@/integrations/supabase/types/functions";
import { DateFilter } from "@/types/invoice";

export const useStockSummary = (startDate: Date, dateFilter: DateFilter) => {
  const { shopId } = useShopId();

  return useQuery<StockSummary>({
    queryKey: ["stock-summary", shopId, dateFilter, startDate],
    queryFn: async () => {
      if (!shopId) return {
        total_income: 0,
        total_expenses: 0,
        stock_in: 0,
        stock_out: 0,
        profit: 0
      };

      try {
        const { data, error } = await supabase.rpc('get_stock_summary');
        
        if (error) {
          console.error("Error fetching stock summary:", error);
          return {
            total_income: 0,
            total_expenses: 0,
            stock_in: 0,
            stock_out: 0,
            profit: 0
          };
        }
        
        // The function returns an array but we expect a single object
        // Extract the first item if it's an array, otherwise use a default object
        const summaryData = Array.isArray(data) && data.length > 0 
          ? data[0] 
          : {
              total_income: 0,
              total_expenses: 0,
              stock_in: 0,
              stock_out: 0,
              profit: 0
            };
        
        return summaryData as StockSummary;
      } catch (error) {
        console.error("Error in stock summary query:", error);
        return {
          total_income: 0,
          total_expenses: 0,
          stock_in: 0,
          stock_out: 0,
          profit: 0
        };
      }
    },
    enabled: !!shopId,
  });
};
