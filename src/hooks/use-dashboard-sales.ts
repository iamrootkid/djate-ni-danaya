
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from "date-fns";
import { useShopId } from "./use-shop-id";
import { DateFilter } from "@/types/invoice";

export interface SalesData {
  date: string;
  total: number;
}

export const useDashboardSales = (dateFilter: DateFilter = "all", startDate: Date = new Date()) => {
  const { shopId } = useShopId();

  return useQuery({
    queryKey: ["dashboard_sales", dateFilter, startDate, shopId],
    queryFn: async () => {
      if (!shopId) return [];

      // Base query
      let query = supabase
        .from("sales")
        .select("created_at, total_amount")
        .eq("shop_id", shopId);
      
      if (dateFilter === "daily") {
        // For daily, get data for the selected day
        const dayStart = startOfDay(startDate);
        const dayEnd = endOfDay(startDate);
        
        query = query
          .gte("created_at", dayStart.toISOString())
          .lte("created_at", dayEnd.toISOString());
      } else if (dateFilter === "yesterday") {
        // For yesterday, get data for the previous day
        const yesterday = subDays(startDate, 1);
        const dayStart = startOfDay(yesterday);
        const dayEnd = endOfDay(yesterday);
        
        query = query
          .gte("created_at", dayStart.toISOString())
          .lte("created_at", dayEnd.toISOString());
      } else if (dateFilter === "monthly") {
        // For monthly, get data for the selected month
        const monthStart = startOfMonth(startDate);
        const monthEnd = endOfMonth(startDate);
        
        query = query
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString());
      }
      
      query = query.order("created_at", { ascending: true });
      
      const { data: sales, error } = await query;
      
      if (error) {
        console.error("Error fetching sales data:", error);
        return [];
      }

      if (!sales || sales.length === 0) {
        return [];
      }
      
      // Process and format the sales data for display
      if (dateFilter === "daily" || dateFilter === "yesterday") {
        // For daily data, show hourly intervals
        const hourlyData: Record<string, number> = {};
        
        // Initialize all hours
        for (let i = 0; i < 24; i++) {
          const hourStr = i.toString().padStart(2, '0') + ':00';
          hourlyData[hourStr] = 0;
        }
        
        // Populate with actual data
        sales.forEach(sale => {
          const saleHour = new Date(sale.created_at).getHours();
          const hourStr = saleHour.toString().padStart(2, '0') + ':00';
          hourlyData[hourStr] = (hourlyData[hourStr] || 0) + (sale.total_amount || 0);
        });
        
        // Convert to array format required by chart
        return Object.entries(hourlyData).map(([hour, total]) => ({
          date: hour,
          total
        }));
      } else if (dateFilter === "monthly") {
        // For monthly data, show daily intervals
        const dailyData: Record<string, number> = {};
        
        // Get days in month
        const year = startDate.getFullYear();
        const month = startDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Initialize all days
        for (let i = 1; i <= daysInMonth; i++) {
          const dateStr = `${i}/${month + 1}`;
          dailyData[dateStr] = 0;
        }
        
        // Populate with actual data
        sales.forEach(sale => {
          const saleDate = new Date(sale.created_at);
          const dateStr = `${saleDate.getDate()}/${saleDate.getMonth() + 1}`;
          dailyData[dateStr] = (dailyData[dateStr] || 0) + (sale.total_amount || 0);
        });
        
        // Convert to array format required by chart
        return Object.entries(dailyData).map(([date, total]) => ({
          date,
          total
        }));
      } else {
        // For all data, group by month or show most recent data points
        const { data: limitedSales } = await supabase
          .from("sales")
          .select("created_at, total_amount")
          .eq("shop_id", shopId)
          .order("created_at", { ascending: false })
          .limit(30); // Get most recent 30 sales
        
        if (!limitedSales || limitedSales.length === 0) return [];
        
        // Group by month/day for better visualization
        const groupedData: Record<string, number> = {};
        
        limitedSales.reverse().forEach(sale => {
          const date = new Date(sale.created_at);
          const formattedDate = format(date, 'MMM d');
          groupedData[formattedDate] = (groupedData[formattedDate] || 0) + (sale.total_amount || 0);
        });
        
        return Object.entries(groupedData).map(([date, total]) => ({
          date,
          total
        }));
      }
    },
    enabled: !!shopId,
  });
};
