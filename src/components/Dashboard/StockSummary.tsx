
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockSummary as StockSummaryType } from "@/integrations/supabase/types/functions";
import { ArrowUp, ArrowDown, DollarSign, Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useShopId } from "@/hooks/use-shop-id";

interface StockSummaryProps {
  startDate: Date;
  dateFilter: "all" | "daily" | "monthly";
}

export const StockSummary = ({ startDate, dateFilter }: StockSummaryProps) => {
  const { shopId } = useShopId();

  const { data: summary, isLoading } = useQuery<StockSummaryType>({
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
        .select("total_amount")
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
      
      // Get sale items for stock movement calculation
      const saleItemsQuery = supabase
        .from("sale_items")
        .select("quantity, sale_id")
        .in("sale_id", supabase.from("sales").select("id").eq("shop_id", shopId));
      
      if (dateFilter !== "all") {
        const start = startDate.toISOString();
        if (dateFilter === "daily") {
          const nextDay = new Date(startDate);
          nextDay.setDate(nextDay.getDate() + 1);
          // We don't filter sale_items directly by date since they don't have shop_id
          // Instead, we filter by sales that are in the date range
          saleItemsQuery.in(
            "sale_id",
            supabase
              .from("sales")
              .select("id")
              .eq("shop_id", shopId)
              .gte("created_at", start)
              .lt("created_at", nextDay.toISOString())
          );
        } else if (dateFilter === "monthly") {
          const nextMonth = new Date(startDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          saleItemsQuery.in(
            "sale_id",
            supabase
              .from("sales")
              .select("id")
              .eq("shop_id", shopId)
              .gte("created_at", start)
              .lt("created_at", nextMonth.toISOString())
          );
        }
      }
      
      console.log("Executing stock summary queries with filter:", dateFilter);
      
      // Execute all queries
      const [salesResult, expensesResult, saleItemsResult] = await Promise.all([
        salesQuery,
        expensesQuery,
        saleItemsQuery
      ]);
      
      if (salesResult.error) {
        console.error("Error fetching sales data:", salesResult.error);
        throw new Error("Failed to fetch sales data");
      }
      
      if (expensesResult.error) {
        console.error("Error fetching expenses data:", expensesResult.error);
        throw new Error("Failed to fetch expenses data");
      }
      
      if (saleItemsResult.error) {
        console.error("Error fetching sale items data:", saleItemsResult.error);
        throw new Error("Failed to fetch sale items data");
      }
      
      // Calculate total income
      const totalIncome = salesResult.data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      
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

  // Calculate net stock change
  const netStockChange = (summary?.stock_in || 0) - (summary?.stock_out || 0);
  const isStockIncreasing = netStockChange >= 0;

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Résumé des stocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Résumé des stocks</CardTitle>
        <Badge variant={summary?.profit && summary.profit > 0 ? "success" : "destructive"}>
          {summary?.profit ? (summary.profit > 0 ? "+" : "") + summary.profit.toLocaleString() + " F CFA" : "0 F CFA"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <p className="text-sm font-medium">Revenu total</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {(summary?.total_income || 0).toLocaleString()} F CFA
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-red-500" />
              <p className="text-sm font-medium">Dépenses totales</p>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {(summary?.total_expenses || 0).toLocaleString()} F CFA
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-medium">Stock entrant</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {summary?.stock_in || 0} unités
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-orange-500" />
              <p className="text-sm font-medium">Stock sortant</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-orange-600">
                {summary?.stock_out || 0} unités
              </p>
              <Badge variant={isStockIncreasing ? "success" : "destructive"} className="ml-2">
                {isStockIncreasing ? "+" : ""}{netStockChange} net
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
