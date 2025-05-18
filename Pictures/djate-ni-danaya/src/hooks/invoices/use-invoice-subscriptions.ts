
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to set up real-time subscriptions for invoice-related changes
 */
export const useInvoiceSubscriptions = (shopId?: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!shopId) {
      console.log("No shop ID available for invoice subscription");
      return;
    }

    console.log("Setting up invoice and modifications subscription for shop:", shopId);
    const channel = supabase
      .channel('dashboard-invoice-changes')
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
      )
      .subscribe();

    return () => {
      console.log("Cleaning up invoice subscription for shop:", shopId);
      supabase.removeChannel(channel);
    };
  }, [queryClient, shopId]);
};
