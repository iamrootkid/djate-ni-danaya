
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockSummary as StockSummaryType } from "@/integrations/supabase/types/functions";
import { useShopId } from "@/hooks/use-shop-id";

export const useStockSummary = (startDate: Date, dateFilter: "all" | "daily" | "monthly") => {
  const { shopId } = useShopId();

  return useQuery<StockSummaryType>({
    queryKey: ["stock-summary", dateFilter, startDate, shopId],
    queryFn: async () => {
      if (!shopId) return {
        total_income: 0,
        total_expenses: 0,
        stock_in: 0,
        stock_out: 0,
        profit: 0
      };

      console.log("Fetching stock summary with manual calculation for shop:", shopId);
      
      // Get total income from sales
      const salesQuery = supabase
        .from("sales")
        .select("id, total_amount")
        .eq("shop_id", shopId);
      
      // Get total expenses 
      const expensesQuery = supabase
        .from("expenses")
        .select("amount, type")
        .eq("shop_id", shopId);
      
      // Apply date filtering
      if (dateFilter !== "all") {
        const start = startDate.toISOString();
        if (dateFilter === "daily") {
          const nextDay = new Date(startDate);
          nextDay.setDate(nextDay.getDate() + 1);
          salesQuery.gte("created_at", start).lt("created_at", nextDay.toISOString());
          expensesQuery.gte("date", start).lt("date", nextDay.toISOString());
        } else if (dateFilter === "monthly") {
          const nextMonth = new Date(startDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          salesQuery.gte("created_at", start).lt("created_at", nextMonth.toISOString());
          expensesQuery.gte("date", start).lt("date", nextMonth.toISOString());
        }
      }
      
      // Execute initial queries to get sales IDs
      const { data: salesData, error: salesError } = await salesQuery;
      
      if (salesError) {
        console.error("Error fetching sales data:", salesError);
        throw new Error("Failed to fetch sales data");
      }
      
      const saleIds = salesData.map(sale => sale.id);
      
      // Get sale items for stock movement calculation
      let saleItemsQuery = supabase
        .from("sale_items")
        .select("quantity, sale_id");
      
      // Only filter by sale_id if we have sales
      if (saleIds.length > 0) {
        saleItemsQuery = saleItemsQuery.in('sale_id', saleIds);
      } else {
        // No sales means no sale items, so we can just return empty data
        return {
          total_income: 0,
          total_expenses: 0,
          stock_in: 0,
          stock_out: 0,
          profit: 0
        };
      }
      
      console.log("Executing stock summary queries with filter:", dateFilter);
      
      // Execute remaining queries
      const [expensesResult, saleItemsResult] = await Promise.all([
        expensesQuery,
        saleItemsQuery
      ]);
      
      if (expensesResult.error) {
        console.error("Error fetching expenses data:", expensesResult.error);
        throw new Error("Failed to fetch expenses data");
      }
      
      if (saleItemsResult.error) {
        console.error("Error fetching sale items data:", saleItemsResult.error);
        throw new Error("Failed to fetch sale items data");
      }
      
      // Calculate total income
      const totalIncome = salesData.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      
      // Calculate total expenses
      const totalExpenses = expensesResult.data?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      
      // Calculate stock out (items sold)
      const stockOut = saleItemsResult.data?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
      
      // Calculate stock in (approximated from stock purchase expenses)
      const stockIn = expensesResult.data
        ?.filter(expense => expense.type === 'stock_purchase')
        .reduce((sum, expense) => sum + Math.floor(Number(expense.amount) / 1000), 0) || 0;
      
      // Calculate profit
      const profit = totalIncome - totalExpenses;
      
      const result = {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        stock_in: stockIn,
        stock_out: stockOut,
        profit: profit
      };
      
      console.log("Stock summary calculation result:", result);
      
      return result;
    },
    enabled: !!shopId,
  });
};
