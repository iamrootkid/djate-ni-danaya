
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/Layout/AppLayout";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardContent } from "@/components/Dashboard/DashboardContent";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const Dashboard = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const {
    shopId,
    userRole,
    dateFilter,
    startDate,
    stats,
    recentOrders,
    handleFilterChange,
    setStartDate,
    invalidateAllDashboardQueries
  } = useDashboard();

  // Force refresh dashboard data when component mounts and set to today's data
  useEffect(() => {
    if (shopId) {
      // Make sure we're looking at today's data
      handleFilterChange("daily");
      // Force invalidate queries to ensure fresh data
      invalidateAllDashboardQueries();
    }
  }, [shopId]);

  // Check for location state indicating we should refresh
  useEffect(() => {
    if (location.state?.refresh) {
      console.log("Dashboard refreshing due to navigation state");
      invalidateAllDashboardQueries();
    }
  }, [location.state, invalidateAllDashboardQueries]);

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

  if (!shopId) {
    return null;
  }

  return (
    <AppLayout>
      <DashboardContent
        dateFilter={dateFilter}
        startDate={startDate}
        userRole={userRole}
        stats={stats}
        recentOrders={recentOrders}
        handleFilterChange={handleFilterChange}
        setStartDate={setStartDate}
      />
    </AppLayout>
  );
};

export default Dashboard;
