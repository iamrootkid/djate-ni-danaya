
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";

export const useInventoryReport = () => {
  const { shopId } = useShopId();

  return useQuery({
    queryKey: ["inventory-report", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          stock,
          price,
          categories(name)
        `)
        .eq("shop_id", shopId)
        .order("stock", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });
};
