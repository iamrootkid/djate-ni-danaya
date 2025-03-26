
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";

export const useSalesReport = (dateRange: DateRange) => {
  const shopId = localStorage.getItem("shopId") || "";

  return useQuery({
    queryKey: ["sales-report", dateRange, shopId],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to || !shopId) return [];
      
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          employee:profiles!sales_employee_id_fkey (
            email
          )
        `)
        .eq("shop_id", shopId)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!dateRange.from && !!dateRange.to && !!shopId,
  });
};
