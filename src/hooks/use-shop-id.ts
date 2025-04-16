import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const useShopId = () => {
  const queryClient = useQueryClient();

  // Force refresh shop ID from backend rather than cache
  const refreshShopId = async () => {
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
  };

  useEffect(() => {
    // Initial refresh when component mounts
    refreshShopId().then(shopId => {
      if (shopId) {
        queryClient.setQueryData(["shop-id"], shopId);
      }
    });

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: shopId } = useQuery({
    queryKey: ["shop-id"],
    queryFn: refreshShopId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  return { shopId };
}; 