
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to set up real-time subscriptions for invoice-related changes
 */
export const useInvoiceSubscriptions = (shopId?: string) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  
  useEffect(() => {
    if (!shopId || isSubscribedRef.current) {
      return;
    }

    console.log("Setting up invoice and modifications subscription for shop:", shopId);
    
    // Clean up any existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    try {
      const channel = supabase
        .channel(`dashboard-invoice-changes-${shopId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'invoices', filter: `shop_id=eq.${shopId}` },
          (payload) => {
            console.log("Invoice change detected:", payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'invoice_modifications', filter: `shop_id=eq.${shopId}` },
          (payload) => {
            console.log("Invoice modification detected:", payload);
            queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] });
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
      console.error("Error setting up invoice channel:", error);
    }

    return () => {
      if (channelRef.current) {
        console.log("Cleaning up invoice subscription for shop:", shopId);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [queryClient, shopId]);
};
