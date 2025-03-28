
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, isValid } from "date-fns";
import { useShopId } from "./use-shop-id";

export interface InvoiceData {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  created_at: string;
  total_amount: number;
  sale_id: string;
  employee_email?: string;
}

export const useDashboardInvoices = (dateFilter: "all" | "daily" | "monthly" | "yesterday" = "daily", startDate: Date = new Date()) => {
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
      if (!shopId) {
        console.log("No shop ID available for fetching invoices");
        return [];
      }

      if (!isValid(startDate)) {
        console.error("Invalid start date provided:", startDate);
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

      console.log("Fetching invoices for verified shop:", shopId, "with filter:", dateFilter);

      try {
        // First try querying with customer_phone to see if it exists
        let query = supabase
          .from("invoices")
          .select(`
            id,
            invoice_number,
            customer_name,
            customer_phone,
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
          .eq("sales.shop_id", shopId);
        
        // Apply date filtering
        if (dateFilter === "daily") {
          const dayStart = startOfDay(startDate);
          const dayEnd = endOfDay(startDate);
          console.log("Daily filter dates:", {
            start: dayStart.toISOString(),
            end: dayEnd.toISOString()
          });
          query = query
            .gte("created_at", dayStart.toISOString())
            .lte("created_at", dayEnd.toISOString());
        } else if (dateFilter === "yesterday") {
          const yesterday = subDays(startDate, 1);
          const dayStart = startOfDay(yesterday);
          const dayEnd = endOfDay(yesterday);
          console.log("Yesterday filter dates:", {
            start: dayStart.toISOString(),
            end: dayEnd.toISOString()
          });
          query = query
            .gte("created_at", dayStart.toISOString())
            .lte("created_at", dayEnd.toISOString());
        } else if (dateFilter === "monthly") {
          const monthStart = startOfMonth(startDate);
          const monthEnd = endOfMonth(startDate);
          console.log("Monthly filter dates:", {
            start: monthStart.toISOString(),
            end: monthEnd.toISOString()
          });
          query = query
            .gte("created_at", monthStart.toISOString())
            .lte("created_at", monthEnd.toISOString());
        } else {
          console.log("Fetching all invoices (no date filter)");
        }

        // Always order by most recent and limit to 5 results
        query = query.order("created_at", { ascending: false }).limit(5);

        const { data, error } = await query;

        if (error) {
          // If the error is about the customer_phone column, retry without it
          if (error.message && error.message.includes("customer_phone")) {
            console.log("customer_phone column does not exist, retrying without it");
            
            // Retry without customer_phone column
            const retryQuery = supabase
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
              .eq("sales.shop_id", shopId);
            
            // Apply the same date filters
            if (dateFilter === "daily") {
              const dayStart = startOfDay(startDate);
              const dayEnd = endOfDay(startDate);
              retryQuery.gte("created_at", dayStart.toISOString())
                        .lte("created_at", dayEnd.toISOString());
            } else if (dateFilter === "yesterday") {
              const yesterday = subDays(startDate, 1);
              const dayStart = startOfDay(yesterday);
              const dayEnd = endOfDay(yesterday);
              retryQuery.gte("created_at", dayStart.toISOString())
                        .lte("created_at", dayEnd.toISOString());
            } else if (dateFilter === "monthly") {
              const monthStart = startOfMonth(startDate);
              const monthEnd = endOfMonth(startDate);
              retryQuery.gte("created_at", monthStart.toISOString())
                        .lte("created_at", monthEnd.toISOString());
            }
            
            retryQuery.order("created_at", { ascending: false }).limit(5);
            
            const { data: retryData, error: retryError } = await retryQuery;
            
            if (retryError) {
              console.error("Error fetching invoices (retry):", retryError);
              throw retryError;
            }
            
            if (!retryData || retryData.length === 0) {
              console.log("No invoices found for shop:", shopId, "with filter:", dateFilter);
              return [];
            }
            
            console.log(`Found ${retryData.length} invoices for shop:`, shopId);
            
            return retryData.map(invoice => {
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
            }).filter(Boolean) as InvoiceData[];
          } else {
            console.error("Error fetching invoices:", error);
            throw error;
          }
        }

        if (!data || data.length === 0) {
          console.log("No invoices found for shop:", shopId, "with filter:", dateFilter);
          return [];
        }

        console.log(`Found ${data.length} invoices for shop:`, shopId);

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
            customer_phone: invoice.customer_phone,
            created_at: invoice.created_at,
            total_amount: sale.total_amount || 0,
            sale_id: invoice.sale_id,
            employee_email: sale.employee?.email || "Email inconnu"
          };
        }).filter(Boolean) as InvoiceData[];
      } catch (error) {
        console.error("Error in useDashboardInvoices:", error);
        return [];
      }
    },
    enabled: !!shopId,
  });
};
