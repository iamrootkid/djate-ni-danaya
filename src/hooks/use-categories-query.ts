
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCategoriesQuery = (shopId: string | undefined) => {
  return useQuery({
    queryKey: ["categories", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      try {
        // Add a small delay to prevent rate limiting issues
        // This helps when multiple components are requesting categories at once
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("shop_id", shopId)
          .order("name");
          
        if (error) {
          console.error("Error fetching categories:", error);
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error("Categories query error:", error);
        // Return empty array instead of throwing to prevent cascading failures
        return [];
      }
    },
    enabled: !!shopId,
    staleTime: 60000, // Cache results for 1 minute to reduce API calls
    retry: (failureCount, error: any) => {
      // Don't retry on 429 errors (rate limiting)
      if (error?.message?.includes('429') || 
          error?.status === 429 || 
          error?.statusCode === 429) {
        return false;
      }
      return failureCount < 2; // otherwise retry once
    },
  });
};
