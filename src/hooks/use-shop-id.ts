import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const useShopId = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('shop-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['shop-id'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: shopId } = useQuery({
    queryKey: ["shop-id"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("shop_id")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (!profile?.shop_id) throw new Error("No shop assigned");

      return profile.shop_id;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  return { shopId };
}; 