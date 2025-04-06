import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useRecentOrders } from "@/hooks/use-recent-orders";
import { useShopId } from "@/hooks/use-shop-id";
import { DateFilter } from "@/types/invoice";

export const useDashboard = () => {
  const [userRole, setUserRole] = useState<"admin" | "employee">("employee");
  // Set default filter to "daily" to show today's data
  const [dateFilter, setDateFilter] = useState<DateFilter>("daily");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
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
  
  // Invalidate all dashboard-related queries
  const invalidateAllDashboardQueries = useCallback(() => {
    if (!shopId) return;
    
    console.log("Invalidating all dashboard queries for shop:", shopId);
    setIsLoading(true);
    
    // Use more specific query keys to improve invalidation precision
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats', shopId, dateFilter] });
    queryClient.invalidateQueries({ queryKey: ['dashboard_sales', shopId, dateFilter] });
    queryClient.invalidateQueries({ queryKey: ['recent-orders', shopId, dateFilter] });
    queryClient.invalidateQueries({ queryKey: ['dashboard_invoices', shopId, dateFilter] });
    queryClient.invalidateQueries({ queryKey: ['inventory-report', shopId] });
    queryClient.invalidateQueries({ queryKey: ['best-selling-products', shopId] });
    queryClient.invalidateQueries({ queryKey: ['products-stock', shopId] });
    queryClient.invalidateQueries({ queryKey: ['stock-summary', shopId, dateFilter] });
    
    // Set a timeout to ensure loading state doesn't get stuck
    setTimeout(() => setIsLoading(false), 1500);
  }, [shopId, queryClient, dateFilter]);
  
  useEffect(() => {
    if (!shopId) {
      console.error("No shop ID found, user should be redirected to login");
      return;
    }

    // Always ensure we're showing today's data on initial load
    const today = new Date();
    setStartDate(today);
    setDateFilter("daily"); // Ensure initial view is today's data

    // Invalidate all dashboard-related queries when shop ID changes
    invalidateAllDashboardQueries();
    
    // Set loading to false after a delay to ensure queries have time to execute
    setTimeout(() => setIsLoading(false), 1500);
  }, [shopId, invalidateAllDashboardQueries]);
  
  const handleFilterChange = useCallback((filter: DateFilter) => {
    setIsLoading(true);
    setDateFilter(filter);
    const today = new Date();
    
    if (filter === "all") {
      setStartDate(today);
    } else if (filter === "daily") {
      setStartDate(today);
    } else if (filter === "monthly") {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDayOfMonth);
    } else if (filter === "yesterday") {
      setStartDate(today); // The yesterday filter will calculate yesterday based on today
    }

    // Invalidate relevant queries when filter changes
    // Use a small timeout to ensure state is updated before invalidation
    setTimeout(() => {
      invalidateAllDashboardQueries();
    }, 100);
  }, [invalidateAllDashboardQueries]);
  
  useEffect(() => {
    if (!shopId) return;

    const channels = [
      supabase
        .channel('dashboard-sales-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sales', filter: `shop_id=eq.${shopId}` },
          () => {
            console.log("Sales change detected, updating dashboard");
            invalidateAllDashboardQueries();
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-products-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products', filter: `shop_id=eq.${shopId}` },
          () => {
            console.log("Products change detected, updating dashboard");
            invalidateAllDashboardQueries();
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-staff-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'staff', filter: `shop_id=eq.${shopId}` },
          () => {
            console.log("Staff change detected, updating dashboard");
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
            console.log("Expenses change detected, updating dashboard");
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats', shopId] });
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-sale-items-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sale_items' },
          (payload) => {
            console.log("Sale items change detected, updating dashboard", payload);
            invalidateAllDashboardQueries();
          }
        )
        .subscribe(),
      
      supabase
        .channel('dashboard-profiles-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            console.log("Profiles change detected, updating dashboard");
            queryClient.invalidateQueries({ queryKey: ['dashboard-invoices', shopId] });
          }
        )
        .subscribe(),

      supabase
        .channel('dashboard-invoice-modifications')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'invoice_modifications', filter: `shop_id=eq.${shopId}` },
          (payload) => {
            console.log("Invoice modification detected, updating dashboard", payload);
            invalidateAllDashboardQueries();
          }
        )
        .subscribe(),
        
      supabase
        .channel('dashboard-invoices-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'invoices', filter: `shop_id=eq.${shopId}` },
          (payload) => {
            console.log("Invoice change detected, updating dashboard", payload);
            invalidateAllDashboardQueries();
          }
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient, shopId, invalidateAllDashboardQueries]);
  
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
  }, [statsLoading, ordersLoading]);
  
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
