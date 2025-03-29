
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useShopId } from "./use-shop-id";
import { InvoiceData, DateFilter } from "@/types/invoice";
import { fetchInvoices } from "@/services/invoiceService";

export { InvoiceData };

export const useDashboardInvoices = (dateFilter: DateFilter = "daily", startDate: Date = new Date()) => {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();

  useEffect(() => {
    if (!shopId) {
      console.log("No shop ID available for invoice subscription");
      return;
    }

    console.log("Setting up invoice subscription for shop:", shopId);
    const channel = supabase
      .channel('invoice-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices', filter: `shop_id=eq.${shopId}` },
        (payload) => {
          console.log("Invoice change detected for shop:", shopId, payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard_invoices', shopId] });
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up invoice subscription for shop:", shopId);
      supabase.removeChannel(channel);
    };
  }, [queryClient, shopId]);

  return useQuery({
    queryKey: ["dashboard_invoices", dateFilter, startDate, shopId],
    queryFn: async () => {
      return await fetchInvoices({ shopId: shopId || "", dateFilter, startDate });
    },
    enabled: !!shopId,
  });
};
