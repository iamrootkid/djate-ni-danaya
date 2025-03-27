
import { useLocation } from "react-router-dom";
import { AppLayout } from "@/components/Layout/AppLayout";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardCards } from "@/components/Dashboard/DashboardCards";
import { SalesChart } from "@/components/Dashboard/SalesChart";
import { RecentOrders } from "@/components/Dashboard/RecentOrders";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { DashboardInvoices } from "@/components/Dashboard/DashboardInvoices";
import { ProductStockStatus } from "@/components/Dashboard/ProductStockStatus";
import { BestSellingProducts } from "@/components/Dashboard/BestSellingProducts";
// Removed StockSummary import
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useRecentOrders } from "@/hooks/use-recent-orders";
import { useShopId } from "@/hooks/use-shop-id";

const Dashboard = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState<"admin" | "employee">("employee");
  const [dateFilter, setDateFilter] = useState<"all" | "daily" | "monthly">("daily");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const queryClient = useQueryClient();
  const { shopId } = useShopId();

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profileData?.role === 'admin') {
          setUserRole('admin');
        }
      }
    };
    getUserRole();
  }, []);

  useEffect(() => {
    if (!shopId) {
      console.error("No shop ID found, user should be redirected to login");
      return;
    }

    const today = new Date();
    setStartDate(today);

    queryClient.invalidateQueries({ queryKey: ['dashboard-stats', shopId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard_sales', shopId] });
    queryClient.invalidateQueries({ queryKey: ['recent-orders', shopId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard_invoices', shopId] });
    queryClient.invalidateQueries({ queryKey: ['stock-summary', shopId] });
    queryClient.invalidateQueries({ queryKey: ['inventory-report', shopId] });
  }, [shopId, queryClient]);

  const handleFilterChange = (filter: "all" | "daily" | "monthly") => {
    setDateFilter(filter);
    const today = new Date();
    
    if (filter === "all") {
      setStartDate(today);
    } else if (filter === "daily") {
      setStartDate(today);
    } else if (filter === "monthly") {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDayOfMonth);
    }

    queryClient.invalidateQueries({ queryKey: ['dashboard-stats', shopId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard_sales', shopId] });
    queryClient.invalidateQueries({ queryKey: ['recent-orders', shopId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard_invoices', shopId] });
    queryClient.invalidateQueries({ queryKey: ['stock-summary', shopId] });
  };

  useEffect(() => {
    if (!shopId) return;

    const channels = [
      supabase
        .channel('dashboard-sales-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sales', filter: `shop_id=eq.${shopId}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard_sales', shopId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', shopId] });
            queryClient.invalidateQueries({ queryKey: ['recent-orders', shopId] });
            queryClient.invalidateQueries({ queryKey: ['stock-summary', shopId] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-products-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products', filter: `shop_id=eq.${shopId}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', shopId] });
            queryClient.invalidateQueries({ queryKey: ['products-stock', shopId] });
            queryClient.invalidateQueries({ queryKey: ['inventory-report', shopId] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-staff-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'staff', filter: `shop_id=eq.${shopId}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', shopId] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-expenses-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'expenses', filter: `shop_id=eq.${shopId}` },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', shopId] });
            queryClient.invalidateQueries({ queryKey: ['stock-summary', shopId] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-sale-items-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sale_items' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['stock-summary', shopId] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-profiles-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-invoices', shopId] });
          }
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient, shopId]);

  const { data: stats } = useDashboardStats(dateFilter, startDate);
  const { data: recentOrders } = useRecentOrders(dateFilter, startDate);

  if (!shopId) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <DashboardHeader
          dateFilter={dateFilter}
          startDate={startDate}
          handleFilterChange={handleFilterChange}
          setStartDate={setStartDate}
          userRole={userRole}
        />
        
        {stats && <DashboardCards stats={stats} />}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <SalesChart dateFilter={dateFilter} startDate={startDate} />
          <DashboardInvoices dateFilter={dateFilter} startDate={startDate} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <ProductStockStatus />
          <BestSellingProducts />
        </div>

        {/* Removed StockSummary component */}

        <RecentOrders orders={recentOrders || []} />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
