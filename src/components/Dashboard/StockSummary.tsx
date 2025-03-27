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

      // Verify the current user has access to this shop
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return {
          total_income: 0,
          total_expenses: 0,
          stock_in: 0,
          stock_out: 0,
          profit: 0
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
          total_income: 0,
          total_expenses: 0,
          stock_in: 0,
          stock_out: 0,
          profit: 0
        };
      }

      try {
        // Format the date for filtering
        const startDateStr = startDate.toISOString();
        
        // Get income from sales
        const { data: salesData, error: salesError } = await supabase
          .from("sales")
          .select("total_amount")
          .eq("shop_id", shopId)
          .gte("created_at", startDateStr);
          
        if (salesError) throw salesError;
        
        // Get expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select("amount")
          .eq("shop_id", shopId)
          .gte("date", startDateStr);
          
        if (expensesError) throw expensesError;
        
        // Get stock movements
        const { data: stockMovements, error: stockError } = await supabase
          .from("stock_movements")
          .select("type, quantity")
          .eq("shop_id", shopId)
          .gte("created_at", startDateStr);
          
        if (stockError) throw stockError;
        
        // Calculate summary
        const totalIncome = salesData.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
        const totalExpenses = expensesData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const stockIn = stockMovements
          .filter(mov => mov.type === 'in')
          .reduce((sum, mov) => sum + (mov.quantity || 0), 0);
        const stockOut = stockMovements
          .filter(mov => mov.type === 'out')
          .reduce((sum, mov) => sum + (mov.quantity || 0), 0);
        const profit = totalIncome - totalExpenses;
        
        return {
          total_income: totalIncome,
          total_expenses: totalExpenses,
          stock_in: stockIn,
          stock_out: stockOut,
          profit: profit
        };
      } catch (error) {
        console.error("Error fetching stock summary:", error);
        throw error;
      }
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
