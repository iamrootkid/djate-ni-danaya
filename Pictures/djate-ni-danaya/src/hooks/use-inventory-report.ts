
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";

export const useInventoryReport = () => {
  const { shopId } = useShopId();

  return useQuery({
    queryKey: ["inventory-report", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      console.log("Fetching inventory report for shop:", shopId);
      
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
      
      if (error) {
        console.error("Error fetching inventory report:", error);
        throw error;
      }
      
      console.log("Inventory report data:", data?.length || 0, "products found");
      return data;
    },
    enabled: !!shopId,
  });
};
