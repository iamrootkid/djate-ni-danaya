
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { StockSummary } from "@/integrations/supabase/types/functions";

export const useStockSummary = (startDate: Date, dateFilter: "all" | "daily" | "monthly") => {
  const { shopId } = useShopId();

  return useQuery<StockSummary[]>({
    queryKey: ["stock-summary", shopId, dateFilter, startDate],
    queryFn: async () => {
      if (!shopId) return [];

      try {
        const { data, error } = await supabase.rpc('get_stock_summary');
        
        if (error) {
          console.error("Error fetching stock summary:", error);
          return [];
        }
        
        return data as StockSummary[];
      } catch (error) {
        console.error("Error in stock summary query:", error);
        return [];
      }
    },
    enabled: !!shopId,
  });
};
