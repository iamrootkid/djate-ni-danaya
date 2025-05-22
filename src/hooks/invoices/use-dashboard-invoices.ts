import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { DateFilter } from "@/types/invoice";
import { useInvoiceSubscriptions } from "./use-invoice-subscriptions";
import { applyDateFilter } from "@/utils/date-filters";

interface DashboardInvoiceResponse {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  created_at: string;
  total_amount: number;
  employee_email: string;
  is_modified: boolean;
  new_total_amount?: number;
}

/**
 * Hook to fetch dashboard invoices with filtering
 */
export const useDashboardInvoices = (dateFilter: DateFilter = "daily", startDate: Date = new Date()) => {
  const { shopId } = useShopId();
  
  // Set up real-time subscriptions
  useInvoiceSubscriptions(shopId);

  return useQuery<DashboardInvoiceResponse[]>({
    queryKey: ["dashboard_invoices", dateFilter, startDate, shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      console.log("Fetching dashboard invoices for shop:", shopId, "with filter:", dateFilter);
      
      // Start building the query
      let query = supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          customer_name,
          customer_phone,
          created_at,
          is_modified,
          new_total_amount,
          sale_id
        `)
        .eq('shop_id', shopId);

      // Apply date filters
      query = applyDateFilter(query, dateFilter, startDate);

      // Apply ordering after filters
      query = query.order('created_at', { ascending: false });
      
      const { data: invoices, error } = await query;

      if (error) {
        console.error("Error fetching invoices:", error);
        throw error;
      }
      
      if (!invoices) {
        console.log("No invoice data returned for shop:", shopId);
        return [];
      }
      
      console.log(`Found ${invoices.length} invoices for shop:`, shopId);
      
      // Process the invoices and fetch additional data separately
      const processedInvoices = await Promise.all(invoices.map(async invoice => {
        // Get sale data for this invoice
        const { data: saleData } = await supabase
          .from('sales')
          .select('total_amount, employee_id')
          .eq('id', invoice.sale_id)
          .single();
        
        const totalAmount = invoice.is_modified && invoice.new_total_amount !== null
          ? invoice.new_total_amount 
          : saleData?.total_amount ?? 0;
        
        // Get employee email
        let employeeEmail = "Email inconnu";
        
        if (saleData?.employee_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', saleData.employee_id)
            .single();
          
          if (profileData) {
            employeeEmail = profileData.email;
          }
        }
        
        return {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          customer_name: invoice.customer_name,
          customer_phone: invoice.customer_phone,
          created_at: invoice.created_at,
          total_amount: totalAmount,
          employee_email: employeeEmail,
          is_modified: invoice.is_modified || false,
          new_total_amount: invoice.new_total_amount
        };
      }));
      
      return processedInvoices;
    },
    enabled: !!shopId,
  });
};
