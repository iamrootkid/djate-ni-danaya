
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
      
      const { data: invoices, error } = await supabase
        .from("invoices")
        .select(`
          id,
          created_at,
          sales (
            total_amount,
            employee_id
          ),
          is_modified,
          new_total_amount
        `)
        .eq("shop_id", shopId)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Now let's fetch all employee data we need in one batch
      const employeeIds = invoices
        .map(invoice => invoice.sales?.employee_id)
        .filter(Boolean) as string[];
      
      if (employeeIds.length === 0) {
        return invoices.map(invoice => ({
          ...invoice,
          total_amount: invoice.is_modified && invoice.new_total_amount !== undefined
            ? invoice.new_total_amount
            : invoice.sales?.total_amount || 0,
          employee: null
        }));
      }
      
      const uniqueEmployeeIds = [...new Set(employeeIds)];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", uniqueEmployeeIds);
      
      // Create a map for quick employee lookup
      const employeeMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          employeeMap.set(profile.id, { email: profile.email });
        });
      }
      
      // Return the processed data with employee information
      return invoices.map(invoice => ({
        ...invoice,
        total_amount: invoice.is_modified && invoice.new_total_amount !== undefined
          ? invoice.new_total_amount
          : invoice.sales?.total_amount || 0,
        employee: employeeMap.get(invoice.sales?.employee_id) || null
      }));
    },
    enabled: !!dateRange.from && !!dateRange.to && !!shopId,
  });
};
