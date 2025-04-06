
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, format } from "date-fns";
import { DateFilter } from "@/types/invoice";
import { useShopId } from "./use-shop-id";
import { BestSellingProduct } from "@/integrations/supabase/types/functions";

export const useBestSellingProducts = (dateFilter: DateFilter = "daily", startDate: Date = new Date()) => {
  const { shopId } = useShopId();
  
  return useQuery<BestSellingProduct[]>({
    queryKey: ["best-selling-products", dateFilter, startDate, shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      try {
        let fromDate: Date;
        let toDate: Date;
        
        switch (dateFilter) {
          case "daily":
            fromDate = startOfDay(startDate);
            toDate = endOfDay(startDate);
            break;
          case "yesterday":
            fromDate = startOfDay(subDays(startDate, 1));
            toDate = endOfDay(subDays(startDate, 1));
            break;
          case "monthly":
            fromDate = startOfMonth(startDate);
            toDate = endOfMonth(startDate);
            break;
          default:
            fromDate = subDays(startOfDay(new Date()), 30);
            toDate = endOfDay(new Date());
            break;
        }
        
        console.log("Fetching best selling products with params:", {
          shopId,
          fromDate: format(fromDate, "yyyy-MM-dd"),
          toDate: format(toDate, "yyyy-MM-dd")
        });
        
        // Call the database function to get best selling products
        const { data, error } = await supabase.rpc("get_best_selling_products", {
          shop_id_param: shopId,
          start_date_param: fromDate.toISOString(),
          end_date_param: toDate.toISOString()
        });
        
        if (error) {
          console.error("Error fetching best selling products:", error);
          throw error;
        }
        
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error in useBestSellingProducts:", error);
        return [];
      }
    },
    enabled: !!shopId,
  });
};
