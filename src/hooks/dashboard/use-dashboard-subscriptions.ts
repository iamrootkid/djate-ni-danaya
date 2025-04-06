
import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { toast } from "@/hooks/use-toast";

export const useDashboardSubscriptions = () => {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  
  // Invalidate all dashboard-related queries
  const invalidateAllDashboardQueries = useCallback(() => {
    if (!shopId) return;
    
    console.log("Invalidating all dashboard queries for shop:", shopId);
    
    // Use more specific query keys to improve invalidation precision
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats', shopId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard_sales', shopId] });
    queryClient.invalidateQueries({ queryKey: ['recent-orders', shopId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard_invoices', shopId] });
    queryClient.invalidateQueries({ queryKey: ['inventory-report', shopId] });
    queryClient.invalidateQueries({ queryKey: ['best-selling-products', shopId] });
    queryClient.invalidateQueries({ queryKey: ['products-stock', shopId] });
    queryClient.invalidateQueries({ queryKey: ['stock-summary', shopId] });
    
    toast({
      title: "Actualisation des données",
      description: "Les données du tableau de bord ont été actualisées."
    });
  }, [shopId, queryClient]);
  
  // Set up real-time subscriptions
  useEffect(() => {
    if (!shopId) return;

    const channels = [
      supabase
        .channel('dashboard-sales-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sales', filter: `shop_id=eq.${shopId}` },
          () => {
            console.log("Sales change detected, updating dashboard");
            invalidateAllDashboardQueries();
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-products-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products', filter: `shop_id=eq.${shopId}` },
          () => {
            console.log("Products change detected, updating dashboard");
            invalidateAllDashboardQueries();
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-staff-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'staff', filter: `shop_id=eq.${shopId}` },
          () => {
            console.log("Staff change detected, updating dashboard");
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', shopId] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-expenses-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'expenses', filter: `shop_id=eq.${shopId}` },
          () => {
            console.log("Expenses change detected, updating dashboard");
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', shopId] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-sale-items-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sale_items' },
          () => {
            console.log("Sale items change detected, updating dashboard");
            invalidateAllDashboardQueries();
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-profiles-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            console.log("Profiles change detected, updating dashboard");
            queryClient.invalidateQueries({ queryKey: ['dashboard-invoices', shopId] });
          }
        )
        .subscribe(),

      supabase
        .channel('dashboard-invoice-modifications')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'invoice_modifications', filter: `shop_id=eq.${shopId}` },
          () => {
            console.log("Invoice modification detected, updating dashboard");
            invalidateAllDashboardQueries();
          }
        )
        .subscribe(),
        
      supabase
        .channel('dashboard-invoices-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'invoices', filter: `shop_id=eq.${shopId}` },
          () => {
            console.log("Invoice change detected, updating dashboard");
            invalidateAllDashboardQueries();
          }
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient, shopId, invalidateAllDashboardQueries]);
  
  return {
    shopId,
    invalidateAllDashboardQueries
  };
};
