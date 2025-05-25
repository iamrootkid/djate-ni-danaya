import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useDashboardSubscriptions } from "@/hooks/dashboard/use-dashboard-subscriptions";
import { useDashboardFilters } from "@/hooks/dashboard/use-dashboard-filters";
import { useDashboardRole } from "@/hooks/dashboard/use-dashboard-role";
import { useDashboardAutoRefresh } from "@/hooks/dashboard/use-dashboard-auto-refresh";
import { DateFilter } from "@/types/invoice";

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
  const { data: stats, isLoading: statsLoading } = useDashboardStats(dateFilter || 'daily', startDate || new Date());
  
  // Update loading state based on query states
  useEffect(() => {
    const isCurrentlyLoading = statsLoading;
    
    if (isCurrentlyLoading) {
      setIsLoading(true);
    } else {
      // Add a slight delay to prevent flickering
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [statsLoading, setIsLoading]);
  
  return {
    shopId,
    userRole: userRole || 'employee',
    dateFilter: dateFilter || 'daily' as DateFilter,
    startDate: startDate || new Date(),
    stats: stats || {
      products: 0,
      sales: 0,
      staff: 0,
      growth: "0%",
      expenses: { total: 0, stock: 0 }
    },
    handleFilterChange,
    setStartDate,
    invalidateAllDashboardQueries,
    isLoading: filtersLoading || statsLoading
  };
};
