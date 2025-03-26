import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface InvoiceData {
  id: string;
  invoice_number: string;
  customer_name: string;
  created_at: string;
  total_amount: number;
  sale_id: string;
  employee_email?: string;
}

export const useDashboardInvoices = () => {
  const queryClient = useQueryClient();

  // Get shop ID from local storage to ensure we have the current session's shop ID
  const getCurrentShopId = () => localStorage.getItem("shopId");

  useEffect(() => {
    const shopId = getCurrentShopId();
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
  }, [queryClient]);

  return useQuery({
    queryKey: ["dashboard_invoices", getCurrentShopId()],
    queryFn: async () => {
      const shopId = getCurrentShopId();
      if (!shopId) {
        console.log("No shop ID available for fetching invoices");
        return [];
      }

      // Verify the current user has access to this shop
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return [];
      }

      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("shop_id")
        .eq("id", user.id)
        .single();

      if (profileError || !userProfile || userProfile.shop_id !== shopId) {
        console.error("User does not have access to this shop:", {
          userId: user.id,
          shopId,
          profileShopId: userProfile?.shop_id
        });
        return [];
      }

      console.log("Fetching invoices for verified shop:", shopId);

      // Get invoices with sales and employee data in a single query
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          customer_name,
          created_at,
          sale_id,
          shop_id,
          sales!inner (
            total_amount,
            shop_id,
            employee:profiles!inner (
              email
            )
          )
        `)
        .eq("shop_id", shopId)
        .eq("sales.shop_id", shopId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching invoices:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No invoices found for shop:", shopId);
        return [];
      }

      console.log("Raw invoice data for shop:", shopId, data);

      return data.map(invoice => {
        const sale = invoice.sales as {
          total_amount: number;
          shop_id: string;
          employee: { email: string } | null;
        };

        // Double check shop ID match
        if (sale.shop_id !== shopId) {
          console.warn("Shop ID mismatch:", {
            invoiceShopId: invoice.shop_id,
            saleShopId: sale.shop_id,
            expectedShopId: shopId
          });
          return null;
        }

        return {
          id: invoice.id,
          invoice_number: invoice.invoice_number,
          customer_name: invoice.customer_name,
          created_at: invoice.created_at,
          total_amount: sale.total_amount || 0,
          sale_id: invoice.sale_id,
          employee_email: sale.employee?.email || "Email inconnu"
        };
      }).filter(Boolean);
    },
    enabled: !!getCurrentShopId(),
  });
};
