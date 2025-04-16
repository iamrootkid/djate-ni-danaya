
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const useShopId = () => {
  const queryClient = useQueryClient();

  // Force refresh shop ID from backend rather than cache
  const refreshShopId = async () => {
    try {
      // First try to get from localStorage for faster load
      const cachedShopId = localStorage.getItem("shopId");
      if (cachedShopId) {
        return cachedShopId;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("shop_id")
        .eq("id", user.id)
        .single();

      if (error || !profile?.shop_id) return null;
      
      // Update local storage with current shop ID
      localStorage.setItem("shopId", profile.shop_id);
      return profile.shop_id;
    } catch (error) {
      console.error("Error refreshing shop ID:", error);
      // Return cached value if available, even on error
      return localStorage.getItem("shopId") || null;
    }
  };

  useEffect(() => {
    // Initial refresh when component mounts
    refreshShopId().then(shopId => {
      if (shopId) {
        queryClient.setQueryData(["shop-id"], shopId);
      }
    });

    // Set up subscription for change monitoring with error handling
    try {
      const channel = supabase
        .channel('shop-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['shop-id'] });
            refreshShopId();
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('Subscription channel error, will retry connection');
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error("Error setting up realtime subscription:", error);
    }
  }, [queryClient]);

  const { data: shopId } = useQuery({
    queryKey: ["shop-id"],
    queryFn: refreshShopId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 429 errors (rate limiting)
      if (error?.message?.includes('429')) {
        return false;
      }
      return failureCount < 2; // otherwise retry once
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  return { shopId };
};
