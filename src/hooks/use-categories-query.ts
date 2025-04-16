
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCategoriesQuery = (shopId: string | undefined) => {
  return useQuery({
    queryKey: ["categories", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("shop_id", shopId)
        .order("name");
        
      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });
};
