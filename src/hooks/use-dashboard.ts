
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useRecentOrders } from "@/hooks/use-recent-orders";
import { useDashboardSubscriptions } from "@/hooks/dashboard/use-dashboard-subscriptions";
import { useDashboardFilters } from "@/hooks/dashboard/use-dashboard-filters";
import { useDashboardRole } from "@/hooks/dashboard/use-dashboard-role";
import { useDashboardAutoRefresh } from "@/hooks/dashboard/use-dashboard-auto-refresh";
import { toast } from "@/hooks/use-toast";

export const useDashboard = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { userRole } = useDashboardRole();
  const { shopId, invalidateAllDashboardQueries } = useDashboardSubscriptions();
  
  // Setup filters with a callback that will invalidate queries when filter changes
  const { 
    dateFilter, 
    startDate, 
    isLoading, 
    setIsLoading,
    handleFilterChange, 
    setStartDate 
  } = useDashboardFilters(() => {
    invalidateAllDashboardQueries();
  });
  
  // Setup auto-refresh
  useDashboardAutoRefresh(shopId);
  
  // Force refresh dashboard data when component mounts and set to today's data
  useEffect(() => {
    if (shopId) {
      // Make sure we're looking at today's data
      handleFilterChange("daily");
      
      // Force invalidate queries to ensure fresh data
      setTimeout(() => {
        invalidateAllDashboardQueries();
        toast({
          title: "Données du jour chargées",
          description: "Les données du tableau de bord ont été mises à jour."
        });
      }, 500); // Small timeout to ensure filter change is processed
    }
  }, [shopId, handleFilterChange, invalidateAllDashboardQueries]);

  // Check for location state indicating we should refresh
  useEffect(() => {
    if (location.state?.refresh) {
      console.log("Dashboard refreshing due to navigation state");
      invalidateAllDashboardQueries();
    }
  }, [location.state, invalidateAllDashboardQueries]);
  
  // Pass the loading state to the query parameters
  const { data: stats, isLoading: statsLoading } = useDashboardStats(dateFilter, startDate);
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders(dateFilter, startDate);
  
  // Update loading state based on query states
  useEffect(() => {
    if (statsLoading || ordersLoading) {
      setIsLoading(true);
    } else {
      // Add a slight delay to prevent flickering
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [statsLoading, ordersLoading, setIsLoading]);
  
  return {
    shopId,
    userRole,
    dateFilter,
    startDate,
    stats,
    recentOrders,
    handleFilterChange,
    setStartDate,
    invalidateAllDashboardQueries,
    isLoading
  };
};
