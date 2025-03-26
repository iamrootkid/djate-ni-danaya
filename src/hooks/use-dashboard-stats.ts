import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStats {
  products: number;
  sales: number;
  staff: number;
  growth: string;
  expenses: {
    total: number;
    stock: number;
  };
}

export const useDashboardStats = (dateFilter: "all" | "daily" | "monthly" = "all", startDate: Date = new Date()) => {
  const shopId = localStorage.getItem("shopId");

  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", shopId, dateFilter, startDate],
    queryFn: async () => {
      if (!shopId) {
        return {
          products: 0,
          sales: 0,
          staff: 0,
          growth: "0%",
          expenses: {
            total: 0,
            stock: 0,
          },
        };
      }

      // Get products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", shopId);

      // Get sales total
      let salesQuery = supabase
        .from("sales")
        .select("total_amount")
        .eq("shop_id", shopId);

      if (dateFilter === "daily") {
        const dayStart = new Date(startDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(startDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        salesQuery = salesQuery
          .gte("created_at", dayStart.toISOString())
          .lte("created_at", dayEnd.toISOString());
      } else if (dateFilter === "monthly") {
        const monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
        
        salesQuery = salesQuery
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString());
      }

      const { data: salesData } = await salesQuery;
      const totalSales = salesData?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;

      // Get staff count
      const { count: staffCount } = await supabase
        .from("staff")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", shopId);

      // Get expenses
      let expensesQuery = supabase
        .from("expenses")
        .select("amount, type")
        .eq("shop_id", shopId);

      if (dateFilter === "daily") {
        const dayStart = new Date(startDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(startDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        expensesQuery = expensesQuery
          .gte("date", dayStart.toISOString())
          .lte("date", dayEnd.toISOString());
      } else if (dateFilter === "monthly") {
        const monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
        
        expensesQuery = expensesQuery
          .gte("date", monthStart.toISOString())
          .lte("date", monthEnd.toISOString());
      }

      const { data: expenses } = await expensesQuery;

      const totalExpenses = expenses?.reduce((acc, exp) => acc + exp.amount, 0) || 0;
      const stockExpenses = expenses
        ?.filter((exp) => exp.type === "stock_purchase")
        .reduce((acc, exp) => acc + exp.amount, 0) || 0;

      // Calculate growth (placeholder for now)
      const growth = "0%";

      return {
        products: productsCount || 0,
        sales: totalSales,
        staff: staffCount || 0,
        growth,
        expenses: {
          total: totalExpenses,
          stock: stockExpenses,
        },
      };
    },
    enabled: !!shopId,
  });
};
