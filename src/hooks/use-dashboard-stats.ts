import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays } from "date-fns";
import { useShopId } from "./use-shop-id";

interface DashboardStats {
  products: number;
  sales: number;
  staff: number;
  growth: string;
  expenses: {
    total: number;
    stock: number;
  };
}

export const useDashboardStats = (dateFilter: "all" | "daily" | "monthly" | "yesterday" = "all", startDate: Date = new Date()) => {
  const { shopId } = useShopId();

  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", dateFilter, startDate, shopId],
    queryFn: async () => {
      if (!shopId) {
        console.error("No shop ID available for fetching dashboard stats");
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

      // Verify the current user has access to this shop
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
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

      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("shop_id")
        .eq("id", user.id)
        .single();

      if (profileError || !userProfile || userProfile.shop_id !== shopId) {
        console.error("User does not have access to this shop:", {
          userId: user.id,
          shopId,
          profileShopId: userProfile?.shop_id
        });
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

      console.log("Fetching dashboard stats for verified shop:", shopId, "with filter:", dateFilter);

      // Get products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", shopId);

      // Get sales total based on date filter
      let salesQuery = supabase
        .from("invoices")
        .select(`
          id,
          sales (
            total_amount
          ),
          is_modified,
          new_total_amount
        `)
        .eq("shop_id", shopId);

      if (dateFilter === "daily") {
        const dayStart = startOfDay(startDate);
        const dayEnd = endOfDay(startDate);
        salesQuery = salesQuery
          .gte("created_at", dayStart.toISOString())
          .lte("created_at", dayEnd.toISOString());
      } else if (dateFilter === "yesterday") {
        const yesterday = subDays(startDate, 1);
        const dayStart = startOfDay(yesterday);
        const dayEnd = endOfDay(yesterday);
        salesQuery = salesQuery
          .gte("created_at", dayStart.toISOString())
          .lte("created_at", dayEnd.toISOString());
      } else if (dateFilter === "monthly") {
        const monthStart = startOfMonth(startDate);
        const monthEnd = endOfMonth(startDate);
        console.log("Monthly filter dates:", {
          start: monthStart.toISOString(),
          end: monthEnd.toISOString()
        });
        salesQuery = salesQuery
          .gte("created_at", monthStart.toISOString())
          .lte("created_at", monthEnd.toISOString());
      }

      const { data: sales } = await salesQuery;
      const totalSales = sales?.reduce((acc, invoice) => {
        const amount = invoice.is_modified && invoice.new_total_amount !== undefined
          ? invoice.new_total_amount
          : invoice.sales?.total_amount || 0;
        return acc + amount;
      }, 0) || 0;

      // Get staff count
      const { count: staffCount } = await supabase
        .from("staff")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", shopId);

      // Get expenses based on date filter
      let expensesQuery = supabase
        .from("expenses")
        .select("amount, type")
        .eq("shop_id", shopId);

      if (dateFilter === "daily") {
        const dayStart = startOfDay(startDate);
        const dayEnd = endOfDay(startDate);
        expensesQuery = expensesQuery
          .gte("date", dayStart.toISOString())
          .lte("date", dayEnd.toISOString());
      } else if (dateFilter === "yesterday") {
        const yesterday = subDays(startDate, 1);
        const dayStart = startOfDay(yesterday);
        const dayEnd = endOfDay(yesterday);
        expensesQuery = expensesQuery
          .gte("date", dayStart.toISOString())
          .lte("date", dayEnd.toISOString());
      } else if (dateFilter === "monthly") {
        const monthStart = startOfMonth(startDate);
        const monthEnd = endOfMonth(startDate);
        expensesQuery = expensesQuery
          .gte("date", monthStart.toISOString())
          .lte("date", monthEnd.toISOString());
      }

      const { data: expenses } = await expensesQuery;

      const totalExpenses = expenses?.reduce((acc, exp) => acc + exp.amount, 0) || 0;
      const stockExpenses = expenses
        ?.filter((exp) => exp.type === "stock_purchase")
        .reduce((acc, exp) => acc + exp.amount, 0) || 0;

      // Calculate growth
      const yesterday = subDays(startDate, 1);
      const { data: yesterdaySales } = await supabase
        .from("sales")
        .select("total_amount")
        .eq("shop_id", shopId)
        .gte("created_at", startOfDay(yesterday).toISOString())
        .lte("created_at", endOfDay(yesterday).toISOString());

      const yesterdayTotal = yesterdaySales?.reduce((acc, sale) => acc + sale.total_amount, 0) || 0;
      const growth = yesterdayTotal > 0
        ? ((totalSales - yesterdayTotal) / yesterdayTotal * 100).toFixed(1)
        : "0";

      console.log("Dashboard stats:", {
        products: productsCount,
        sales: totalSales,
        staff: staffCount,
        growth: `${growth}%`,
        expenses: {
          total: totalExpenses,
          stock: stockExpenses,
        }
      });

      return {
        products: productsCount || 0,
        sales: totalSales,
        staff: staffCount || 0,
        growth: `${growth}%`,
        expenses: {
          total: totalExpenses,
          stock: stockExpenses,
        },
      };
    },
    enabled: !!shopId,
  });
};
