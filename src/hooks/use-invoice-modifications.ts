import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useShopId } from "./use-shop-id";
import { InvoiceModification } from "@/types/invoice";
import { useToast } from "./use-toast";

export const useInvoiceModifications = (invoiceId?: string) => {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  const { toast } = useToast();

  // Fetch modifications for a specific invoice
  const { data: modifications, isLoading, error } = useQuery({
    queryKey: ["invoice-modifications", invoiceId],
    queryFn: async () => {
      if (!invoiceId || !shopId) return [];

      // Use type assertion for the RPC function name
      const { data, error } = await supabase.rpc(
        "get_invoice_modifications" as any,
        { invoice_id: invoiceId }
      );

      if (error) throw error;
      
      // First cast to unknown, then to the desired type
      return (data || []) as unknown as InvoiceModification[];
    },
    enabled: !!invoiceId && !!shopId,
  });

  // Set up real-time subscription for invoice modifications
  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel("invoice-modifications-channel")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "invoice_modifications",
          filter: `shop_id=eq.${shopId}${invoiceId ? ` AND invoice_id=eq.${invoiceId}` : ""}`
        },
        (payload) => {
          console.log("Invoice modification change detected:", payload);
          
          // Invalidate the specific invoice modifications query
          if (invoiceId) {
            queryClient.invalidateQueries({ queryKey: ["invoice-modifications", invoiceId] });
          }
          
          // Invalidate the general invoices query
          queryClient.invalidateQueries({ queryKey: ["invoices"] });
          
          // Invalidate dashboard data
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard_sales"] });
          queryClient.invalidateQueries({ queryKey: ["dashboard_invoices"] });
          
          // Invalidate stock data
          queryClient.invalidateQueries({ queryKey: ["products-stock"] });
          queryClient.invalidateQueries({ queryKey: ["inventory-report"] });
          queryClient.invalidateQueries({ queryKey: ["stock-summary"] });
          
          // Invalidate sales data
          queryClient.invalidateQueries({ queryKey: ["best-selling-products"] });
          queryClient.invalidateQueries({ queryKey: ["recent-orders"] });
          
          // Invalidate expense data
          queryClient.invalidateQueries({ queryKey: ["expenses"] });
          
          // Show notification for new modifications
          if (payload.eventType === "INSERT") {
            toast({
              title: "Invoice Modified",
              description: "The invoice has been modified and all related data has been updated.",
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, shopId, invoiceId, toast]);

  return {
    modifications,
    isLoading,
    error,
  };
}; 