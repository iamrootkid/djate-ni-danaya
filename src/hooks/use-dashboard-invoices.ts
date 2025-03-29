import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useShopId } from "./use-shop-id";
import { DateFilter } from "@/types/invoice";
import { Database } from "@/integrations/supabase/types";

type InvoiceResponse = Database["public"]["Tables"]["invoices"]["Row"] & {
  sales?: {
    total_amount: number;
  };
  is_modified: boolean;
  new_total_amount?: number;
};

interface DashboardInvoiceResponse extends InvoiceResponse {
  total_amount: number;
}

export const useDashboardInvoices = (dateFilter: DateFilter = "daily", startDate: Date = new Date()) => {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();

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

  return useQuery<DashboardInvoiceResponse[]>({
    queryKey: ["dashboard_invoices", dateFilter, startDate, shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          customer_name,
          customer_phone,
          created_at,
          sales (
            total_amount
          ),
          new_total_amount,
          is_modified
        `)
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as unknown as InvoiceResponse[]).map(invoice => ({
        ...invoice,
        total_amount: invoice.is_modified && invoice.new_total_amount !== undefined 
          ? invoice.new_total_amount 
          : invoice.sales?.total_amount ?? 0
      }));
    },
    enabled: !!shopId,
  });
};
