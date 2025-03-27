
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/Layout/AppLayout";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardContent } from "@/components/Dashboard/DashboardContent";

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
    setStartDate
  } = useDashboard();

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
