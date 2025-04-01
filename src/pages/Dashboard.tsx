
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/Layout/AppLayout";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardContent } from "@/components/Dashboard/DashboardContent";
import { useEffect } from "react";

const Dashboard = () => {
  const location = useLocation();
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

  // Force refresh dashboard data when component mounts
  useEffect(() => {
    if (shopId) {
      // Make sure we're looking at today's data
      handleFilterChange("daily");
      // Force invalidate queries to ensure fresh data
      invalidateAllDashboardQueries();
    }
  }, [shopId]);

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
