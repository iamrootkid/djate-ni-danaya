
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useShopId } from "@/hooks/use-shop-id";
import { supabase } from "@/integrations/supabase/client";
import { useInvoiceSubscriptions } from "@/hooks/invoices/use-invoice-subscriptions";

export const useDashboardSubscriptions = () => {
  const { shopId } = useShopId();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  
  // Set up invoice subscriptions
  useInvoiceSubscriptions(shopId);

  const invalidateAllDashboardQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] });
    queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
    queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
    queryClient.invalidateQueries({ queryKey: ['client-count'] });
    queryClient.invalidateQueries({ queryKey: ['transaction-count'] });
  };

  // Set up other real-time subscriptions for dashboard
  useEffect(() => {
    if (!shopId || isSubscribedRef.current) {
      return;
    }

    // Clean up any existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSubscribedRef.current = false;
    }

    try {
      const channel = supabase
        .channel(`dashboard-changes-${shopId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sales', filter: `shop_id=eq.${shopId}` },
          () => {
            console.log('Sales changed, invalidating dashboard queries');
            invalidateAllDashboardQueries();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'expenses', filter: `shop_id=eq.${shopId}` },
          () => {
            console.log('Expenses changed, invalidating dashboard queries');
            invalidateAllDashboardQueries();
          }
        );

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          channelRef.current = channel;
        }
      });

    } catch (error) {
      console.error("Error setting up dashboard channel:", error);
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [shopId, queryClient]);

  return {
    shopId,
    invalidateAllDashboardQueries
  };
};
