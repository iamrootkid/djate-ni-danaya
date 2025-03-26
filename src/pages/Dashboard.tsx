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
import { StockSummary } from "@/components/Dashboard/StockSummary";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useRecentOrders } from "@/hooks/use-recent-orders";

const Dashboard = () => {
  const location = useLocation();
  const [userRole, setUserRole] = useState<"admin" | "employee">("employee");
  const [dateFilter, setDateFilter] = useState<"all" | "daily" | "monthly">("daily");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const queryClient = useQueryClient();
  const shopId = localStorage.getItem("shopId");

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

  // Redirect if no shop ID is found
  useEffect(() => {
    if (!shopId) {
      console.error("No shop ID found, user should be redirected to login");
      // This is handled by the ProtectedRoute in App.tsx
    }
  }, [shopId]);

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
    
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard_sales'] });
    queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] });
  };

  useEffect(() => {
    if (!shopId) return;

    const channels = [
      supabase
        .channel('dashboard-sales-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sales' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard_sales'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-products-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['products-stock'] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-staff-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'staff' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-expenses-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'expenses' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-profiles-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-invoices'] });
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
          <DashboardInvoices />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <ProductStockStatus />
          <BestSellingProducts />
        </div>

        <StockSummary dateFilter={dateFilter} startDate={startDate} />

        <RecentOrders orders={recentOrders || []} />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
