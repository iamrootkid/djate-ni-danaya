
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BestSellingProduct } from "@/integrations/supabase/types/functions";

export const useBestSellingProducts = () => {
  const shopId = localStorage.getItem("shopId") || "";

  return useQuery<BestSellingProduct[]>({
    queryKey: ["bestSellingProducts", shopId],
    queryFn: async () => {
      if (!shopId) {
        return [];
      }

      const { data, error } = await supabase.rpc("get_best_selling_products", {
        shop_id: shopId
      });

      if (error) {
        console.error("Error fetching best selling products:", error);
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!shopId,
  });
};
