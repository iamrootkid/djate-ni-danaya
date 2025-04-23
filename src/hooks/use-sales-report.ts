import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { useShopId } from "./use-shop-id";

export const useSalesReport = (dateRange: DateRange) => {
  const { shopId } = useShopId();

  return useQuery({
    queryKey: ["sales-report", dateRange, shopId],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to || !shopId) return [];
      
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          created_at,
          sales (
            total_amount,
            employee:profiles!sales_employee_id_fkey (
              email
            )
          ),
          is_modified,
          new_total_amount
        `)
        .eq("shop_id", shopId)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data.map(invoice => ({
        ...invoice,
        total_amount: invoice.is_modified && invoice.new_total_amount !== undefined
          ? invoice.new_total_amount
          : invoice.sales?.total_amount || 0,
        employee: invoice.sales?.employee
      }));
    },
    enabled: !!dateRange.from && !!dateRange.to && !!shopId,
  });
};
