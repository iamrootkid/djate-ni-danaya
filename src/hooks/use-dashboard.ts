
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useRecentOrders } from "@/hooks/use-recent-orders";
import { useDashboardSubscriptions } from "@/hooks/dashboard/use-dashboard-subscriptions";
import { useDashboardFilters } from "@/hooks/dashboard/use-dashboard-filters";
import { useDashboardRole } from "@/hooks/dashboard/use-dashboard-role";
import { useDashboardAutoRefresh } from "@/hooks/dashboard/use-dashboard-auto-refresh";

export const useDashboard = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { userRole } = useDashboardRole();
  const { shopId, invalidateAllDashboardQueries } = useDashboardSubscriptions();
  
  // Setup filters with a callback that will invalidate queries when filter changes
  const { 
    dateFilter, 
    startDate, 
    isLoading: filtersLoading, 
    setIsLoading,
    handleFilterChange, 
    setStartDate 
  } = useDashboardFilters(() => {
    invalidateAllDashboardQueries();
  });
  
  // Setup auto-refresh
  useDashboardAutoRefresh(shopId);
  
  // Load data in parallel with proper suspense handling
  const { data: stats, isLoading: statsLoading } = useDashboardStats(dateFilter, startDate);
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders(dateFilter, startDate);
  
  // Update loading state based on query states
  useEffect(() => {
    const isCurrentlyLoading = statsLoading || ordersLoading;
    
    if (isCurrentlyLoading) {
      setIsLoading(true);
    } else {
      // Add a slight delay to prevent flickering
      const timer = setTimeout(() => setIsLoading(false), 300);
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
    isLoading: filtersLoading || statsLoading || ordersLoading
  };
};
