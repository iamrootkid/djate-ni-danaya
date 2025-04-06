
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useDashboardAutoRefresh = (shopId: string | null) => {
  const queryClient = useQueryClient();
  
  // Set up recurring refresh for critical data
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (shopId) {
        console.log("Auto-refreshing dashboard data");
        queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] });
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [shopId, queryClient]);
};
