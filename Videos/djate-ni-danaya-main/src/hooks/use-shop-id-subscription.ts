
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useShopIdSubscription = (shopId?: string) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!shopId || isSubscribedRef.current) {
      return;
    }

    console.log("Setting up profiles changes subscription for shop:", shopId);
    
    // Clean up any existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    try {
      const channel = supabase
        .channel(`profiles-changes-${shopId}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'profiles',
            filter: `shop_id=eq.${shopId}`
          },
          (payload) => {
            console.log("Profile change detected:", payload);
            queryClient.invalidateQueries({ queryKey: ['shop-data'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }
        );

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          channelRef.current = channel;
        }
      });

    } catch (error) {
      console.error("Error setting up channel:", error);
    }

    return () => {
      if (channelRef.current) {
        console.log("Cleaning up profiles subscription for shop:", shopId);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [shopId, queryClient]);
};
