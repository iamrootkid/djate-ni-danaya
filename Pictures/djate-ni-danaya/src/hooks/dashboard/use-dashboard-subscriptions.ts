
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useShopId } from "@/hooks/use-shop-id";
import { supabase } from "@/integrations/supabase/client";
import { useInvoiceSubscriptions } from "@/hooks/invoices/use-invoice-subscriptions";

export const useDashboardSubscriptions = () => {
  const { shopId } = useShopId();
  const queryClient = useQueryClient();
  
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
    if (!shopId) return;

    const channel = supabase
      .channel('dashboard-changes')
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
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, queryClient]);

  return {
    shopId,
    invalidateAllDashboardQueries
  };
};
