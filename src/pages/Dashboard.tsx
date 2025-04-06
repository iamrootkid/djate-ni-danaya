import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/Layout/AppLayout";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardContent } from "@/components/Dashboard/DashboardContent";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const initialLoadDone = useRef(false);
  const {
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
  } = useDashboard();

  // Force refresh dashboard data when component mounts and set to today's data
  useEffect(() => {
    if (shopId && !initialLoadDone.current) {
      initialLoadDone.current = true;
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
  }, [shopId]);

  // Check for location state indicating we should refresh
  useEffect(() => {
    if (location.state?.refresh) {
      console.log("Dashboard refreshing due to navigation state");
      invalidateAllDashboardQueries();
      toast({
        title: "Actualisation",
        description: "Les données du tableau de bord ont été rafraîchies."
      });
    }
  }, [location.state, invalidateAllDashboardQueries]);

  // Set up recurring refresh for critical data - but without toasts
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (shopId) {
        console.log("Auto-refreshing dashboard data");
        queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] });
      }
    }, 60000); // Refresh every 60 seconds instead of 30
    
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
        isLoading={isLoading}
      />
    </AppLayout>
  );
};

export default Dashboard;
