
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardAutoRefresh = (shopId: string | null) => {
  const queryClient = useQueryClient();
  
  // Set up recurring refresh for critical data
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (shopId) {
        console.log("Auto-refreshing dashboard data silently");
        // Silently invalidate queries without triggering loading states
        queryClient.invalidateQueries({ 
          queryKey: ['stock-summary'],
          type: 'inactive'
        });
        queryClient.invalidateQueries({ 
          queryKey: ['dashboard-stats'],
          type: 'inactive'
        });
        queryClient.invalidateQueries({ 
          queryKey: ['dashboard_invoices'],
          type: 'inactive'
        });
      }
    }, 60000); // Refresh every 60 seconds
    
    return () => clearInterval(intervalId);
  }, [shopId, queryClient]);
  
  // Set up real-time subscriptions
  useEffect(() => {
    if (!shopId) return;
    
    const channels = [
      // Listen for sales changes
      supabase
        .channel('dashboard-sales-updates')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'sales',
            filter: `shop_id=eq.${shopId}`
          },
          () => {
            console.log("Sales data changed, refreshing");
            queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
          }
        )
        .subscribe(),
        
      // Listen for expense changes
      supabase
        .channel('dashboard-expense-updates')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'expenses',
            filter: `shop_id=eq.${shopId}`
          },
          () => {
            console.log("Expense data changed, refreshing");
            queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
          }
        )
        .subscribe(),
        
      // Listen for invoice changes
      supabase
        .channel('dashboard-invoice-updates')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'invoices',
            filter: `shop_id=eq.${shopId}`
          },
          () => {
            console.log("Invoice data changed, refreshing");
            queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] });
          }
        )
        .subscribe()
    ];
    
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [shopId, queryClient]);
};
