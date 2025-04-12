
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
};
