
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useShopId } from "./use-shop-id";
import { BestSellingProduct } from "@/integrations/supabase/types/functions";

interface BestSellingProductsOptions {
  limit?: number;
}

export const useBestSellingProducts = (options: BestSellingProductsOptions = {}) => {
  const { shopId } = useShopId();
  const limit = options.limit || 5;

  return useQuery<BestSellingProduct[]>({
    queryKey: ["best-selling-products", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      // Get current month boundaries
      const today = new Date();
      const startDate = startOfMonth(today);
      const endDate = endOfMonth(today);
      
      try {
        // Call the RPC function to get best selling products
        const { data, error } = await supabase.rpc("get_best_selling_products", {
          shop_id_param: shopId,
          start_date_param: format(startDate, "yyyy-MM-dd"),
          end_date_param: format(endDate, "yyyy-MM-dd")
        });

        if (error) {
          console.error("Error fetching best selling products:", error);
          throw error;
        }

        if (!data) return [];

        // Limit the results
        return data.slice(0, limit);
      } catch (err) {
        console.error("Error in useBestSellingProducts:", err);
        return [];
      }
    },
    enabled: !!shopId,
  });
};
