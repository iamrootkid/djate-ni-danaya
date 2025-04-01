
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "./use-shop-id";
import { addDays, format, startOfDay, subDays } from "date-fns";
import { DateFilter } from "@/types/invoice";

export const useStockSummary = (startDate?: Date, dateFilter?: DateFilter) => {
  const { shopId } = useShopId();
  
  // Use default range of last 30 days if no range provided
  const today = new Date();
  const defaultStartDate = subDays(today, 30);
  
  const start = startDate || defaultStartDate;
  
  const formattedStartDate = format(startOfDay(start), "yyyy-MM-dd");
  
  // Convert DateFilter to filter_type expected by the RPC function
  const getFilterType = () => {
    switch (dateFilter) {
      case "daily": return "daily";
      case "monthly": return "monthly";
      case "yesterday": return "yesterday";
      default: return "all";
    }
  };
  
  const filterType = getFilterType();
  
  return useQuery({
    queryKey: ["stock-summary", shopId, formattedStartDate, filterType],
    queryFn: async () => {
      if (!shopId) {
        throw new Error("Shop ID is required");
      }
      
      console.log("Fetching stock summary for:", {
        shopId,
        startDate: formattedStartDate,
        filterType
      });
      
      // Use explicit type casting to make TypeScript happy
      const { data, error } = await supabase.rpc("get_stock_summary", {
        start_date: formattedStartDate,
        filter_type: filterType,
        shop_id: shopId
      } as any);
      
      if (error) {
        console.error("Error fetching stock summary:", error);
        throw error;
      }
      
      // Return the first item in the array, or a default object if empty
      return data && data.length > 0 ? data[0] : {
        total_income: 0,
        total_expenses: 0,
        stock_in: 0,
        stock_out: 0,
        profit: 0
      };
    },
    enabled: !!shopId
  });
};
