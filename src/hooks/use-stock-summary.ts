
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "./use-shop-id";
import { addDays, format, startOfDay, subDays } from "date-fns";

export const useStockSummary = (dateRange?: { start: Date; end: Date }) => {
  const { shopId } = useShopId();
  
  // Use default range of last 30 days if no range provided
  const today = new Date();
  const defaultStartDate = subDays(today, 30);
  
  const start = dateRange?.start || defaultStartDate;
  const end = dateRange?.end || today;
  
  const formattedStartDate = format(startOfDay(start), "yyyy-MM-dd");
  const formattedEndDate = format(addDays(end, 1), "yyyy-MM-dd"); // Add 1 day to include the end date
  
  return useQuery({
    queryKey: ["stock-summary", shopId, formattedStartDate, formattedEndDate],
    queryFn: async () => {
      if (!shopId) {
        throw new Error("Shop ID is required");
      }
      
      console.log("Fetching stock summary for:", {
        shopId,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      });
      
      // Use explicit type casting to make TypeScript happy
      const { data, error } = await supabase.rpc("get_stock_summary", {
        shop_id_param: shopId,
        start_date_param: formattedStartDate,
        end_date_param: formattedEndDate
      } as any);
      
      if (error) {
        console.error("Error fetching stock summary:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!shopId
  });
};
