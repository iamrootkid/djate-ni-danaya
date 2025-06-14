
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { useShopId } from "./use-shop-id";

export const useBestSellingProducts = (dateRange: DateRange) => {
  const { shopId } = useShopId();

  return useQuery({
    queryKey: ["best-selling-products", dateRange, shopId],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to || !shopId) return [];
      
      const { data, error } = await supabase.rpc('get_best_selling_products', {
        shop_id_param: shopId,
        start_date_param: dateRange.from.toISOString(),
        end_date_param: dateRange.to.toISOString()
      });
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!dateRange.from && !!dateRange.to && !!shopId,
  });
};
