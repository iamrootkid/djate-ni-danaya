
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define the Shop interface directly here
export interface Shop {
  id: string;
  name: string;
  address: string | null; 
  created_at: string;
  owner_id: string | null;
  updated_at: string;
}

export const useShops = () => {
  const currentShopId = localStorage.getItem("shopId");
  
  return useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      // We now always require a specific shop ID
      if (!currentShopId) {
        console.error("No shop ID found in localStorage");
        return [] as Shop[]; // Return empty array if no shop ID
      }
      
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', currentShopId);

      if (error) {
        console.error("Error loading shops:", error);
        throw error;
      }

      return data || [] as Shop[];
    },
  });
};

export const useShop = (shopId: string | null) => {
  // If no shopId provided, use the one from localStorage
  const effectiveShopId = shopId || localStorage.getItem("shopId");
  
  return useQuery({
    queryKey: ["shop", effectiveShopId],
    queryFn: async () => {
      if (!effectiveShopId) return null;

      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', effectiveShopId)
        .single();

      if (error) {
        console.error("Error loading shop:", error);
        throw error;
      }

      return data as Shop;
    },
    enabled: !!effectiveShopId,
  });
};
