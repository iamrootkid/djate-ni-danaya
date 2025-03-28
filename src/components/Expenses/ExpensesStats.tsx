import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
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
      let query = supabase
        .from("expenses")
        .select("type, amount")
        .eq('shop_id', shopId);

      if (filterType !== "all" && dateRange?.from) {
        if (filterType === "daily") {
          query = query
            .gte("date", startOfDay(dateRange.from).toISOString())
            .lte("date", endOfDay(dateRange.to || dateRange.from).toISOString());
        } else if (filterType === "monthly") {
          query = query
            .gte("date", startOfMonth(dateRange.from).toISOString())
            .lte("date", endOfMonth(dateRange.to || dateRange.from).toISOString());
        }
      }

      const { data: expenses } = await query;

      if (!expenses) return null;

      const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      const byType = expenses.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>);

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
            {stats?.total?.toLocaleString()} F CFA
          </div>
        </CardContent>
      </Card>
      {stats?.byType && Object.entries(stats.byType).map(([type, amount]) => (
        <Card key={type}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{typeLabels[type]}</CardTitle>
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
