import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useShopId } from "./use-shop-id";
import { DateFilter } from "@/types/invoice";
import { Database } from "@/integrations/supabase/types";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from "date-fns";

type InvoiceResponse = Database["public"]["Tables"]["invoices"]["Row"] & {
  sales?: {
    total_amount: number;
    employee?: {
      email: string;
    };
  };
  is_modified: boolean;
  new_total_amount?: number;
};

interface DashboardInvoiceResponse extends InvoiceResponse {
  total_amount: number;
  employee_email: string;
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
      
      let query = supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          customer_name,
          customer_phone,
          created_at,
          sales (
            total_amount,
            employee:profiles!sales_employee_id_fkey (
              email
            )
          ),
          new_total_amount,
          is_modified
        `)
        .eq('shop_id', shopId);

      // Apply date filters
      if (dateFilter === "daily") {
        const dayStart = startOfDay(startDate);
        const dayEnd = endOfDay(startDate);
        query = query
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());
      } else if (dateFilter === "yesterday") {
        const yesterday = subDays(startDate, 1);
        const dayStart = startOfDay(yesterday);
        const dayEnd = endOfDay(yesterday);
        query = query
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString());
      } else if (dateFilter === "monthly") {
        const monthStart = startOfMonth(startDate);
        const monthEnd = endOfMonth(startDate);
        query = query
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());
      }

      // Apply ordering after filters
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      return (data as unknown as InvoiceResponse[]).map(invoice => ({
        ...invoice,
        total_amount: invoice.is_modified && invoice.new_total_amount !== undefined 
          ? invoice.new_total_amount 
          : invoice.sales?.total_amount ?? 0,
        employee_email: invoice.sales?.employee?.email || "Email inconnu"
      }));
    },
    enabled: !!shopId,
  });
};
