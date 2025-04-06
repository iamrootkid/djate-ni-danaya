
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format } from "date-fns";
import { useShopId } from "@/hooks/use-shop-id";

interface ExpensesStatsProps {
  filterType: "all" | "daily" | "monthly";
  dateRange: DateRange | undefined;
}

export const ExpensesStats = ({ filterType, dateRange }: ExpensesStatsProps) => {
  const { shopId } = useShopId();

  const { data: stats } = useQuery({
    queryKey: ["expenses-stats", filterType, dateRange, shopId],
    queryFn: async () => {
      if (!shopId) return null;
      
      console.log("Fetching expenses with filter:", filterType, "and dateRange:", dateRange);
      
      let query = supabase
        .from("expenses")
        .select("type, amount")
        .eq('shop_id', shopId);

      // Apply date filtering logic
      if (dateRange?.from) {
        if (filterType === "daily") {
          const fromDate = startOfDay(dateRange.from);
          const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
          
          // For expenses, we need to use the date field which is a date type (not timestamp)
          const fromDateStr = format(fromDate, "yyyy-MM-dd");
          const toDateStr = format(toDate, "yyyy-MM-dd");
          
          console.log("Filtering expenses for date range:", fromDateStr, "to", toDateStr);
          
          query = query
            .gte("date", fromDateStr)
            .lte("date", toDateStr);
        } else if (filterType === "monthly") {
          const fromMonth = startOfMonth(dateRange.from);
          const toMonth = dateRange.to ? endOfMonth(dateRange.to) : endOfMonth(dateRange.from);
          
          // For expenses, we need to use the date field which is a date type (not timestamp)
          const fromDateStr = format(fromMonth, "yyyy-MM-dd");
          const toDateStr = format(toMonth, "yyyy-MM-dd");
          
          console.log("Filtering expenses for month range:", fromDateStr, "to", toDateStr);
          
          query = query
            .gte("date", fromDateStr)
            .lte("date", toDateStr);
        }
      } else if (filterType === "daily") {
        // If no dateRange but filter is daily, default to today
        const today = new Date();
        const todayStr = format(today, "yyyy-MM-dd");
        
        console.log("No date range provided, defaulting to today:", todayStr);
        
        query = query
          .eq("date", todayStr);
      }

      const { data: expenses, error } = await query;
      
      if (error) {
        console.error("Error fetching expenses:", error);
        return null;
      }

      if (!expenses || !Array.isArray(expenses)) return { total: 0, byType: {} };

      const total = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
      const byType = expenses.reduce((acc, curr) => {
        if (curr.type) {
          acc[curr.type] = (acc[curr.type] || 0) + Number(curr.amount);
        }
        return acc;
      }, {} as Record<string, number>);

      console.log("Calculated expense stats:", { total, byType });
      return { total, byType };
    },
    enabled: !!shopId,
  });

  const typeLabels: Record<string, string> = {
    salary: "Salaires",
    commission: "Commissions",
    utility: "Factures",
    shop_maintenance: "Maintenance",
    stock_purchase: "Achats de stock",
    loan_shop: "Prêts boutique",
    other: "Autres",
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total des dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.total?.toLocaleString() || "0"} F CFA
          </div>
          {filterType === "daily" && dateRange?.from && (
            <p className="text-xs text-muted-foreground">
              {format(dateRange.from, "dd MMMM yyyy")}
            </p>
          )}
        </CardContent>
      </Card>
      {stats?.byType && Object.entries(stats.byType).map(([type, amount]) => (
        <Card key={type}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{typeLabels[type] || type}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {amount.toLocaleString()} F CFA
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
