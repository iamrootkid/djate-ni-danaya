
import { AppLayout } from "@/components/Layout/AppLayout";
import { DashboardContent } from "@/components/Dashboard/DashboardContent";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useDashboard } from "@/hooks/use-dashboard";
import { useDashboardSales } from "@/hooks/use-dashboard-sales";

const Dashboard = () => {
  const { toast } = useToast();
  const { 
    userRole,
    shopId,
    dateFilter,
    startDate,
    stats,
    recentOrders,
    handleFilterChange,
    setStartDate,
    invalidateAllDashboardQueries,
    isLoading
  } = useDashboard();

  // Get sales data separately to avoid dependency cycles
  const {
    data: salesData,
    isLoading: salesLoading,
    isError: salesError
  } = useDashboardSales(dateFilter, startDate);

  const filters = {
    statsPeriod: dateFilter,
    salesPeriod: dateFilter,
    statsStartDate: startDate,
    salesStartDate: startDate,
    autoRefresh: true
  };

  const isAdmin = userRole === 'admin' || userRole === 'owner';

  return (
    <AppLayout>
      <DashboardContent
        stats={stats || {
          products: 0,
          sales: 0,
          staff: 0,
          growth: "0%",
          expenses: { total: 0, stock: 0 }
        }}
        salesData={salesData}
        isAdmin={isAdmin}
        userRole={userRole}
        loading={{
          stats: isLoading,
          sales: salesLoading,
        }}
        errors={{
          stats: false,
          sales: salesError || false,
        }}
        filters={filters}
        // Pass the real filter values and handlers here:
        dateFilter={dateFilter}
        startDate={startDate}
        handleFilterChange={handleFilterChange}
        setStartDate={setStartDate}
      />
      <Toaster />
    </AppLayout>
  );
};
export default Dashboard;
