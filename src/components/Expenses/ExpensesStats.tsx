import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { useShopId } from "@/hooks/use-shop-id";
import { safeGet, filterByUUID } from "@/utils/supabaseHelpers";

interface ExpensesStatsProps {
  filterType: "all" | "daily" | "monthly";
  dateRange: DateRange | undefined;
}

interface ExpenseData {
  type: string;
  amount: number;
}

export const ExpensesStats = ({ filterType, dateRange }: ExpensesStatsProps) => {
  const { shopId } = useShopId();

  const { data: stats } = useQuery({
    queryKey: ["expenses-stats", filterType, dateRange, shopId],
    queryFn: async () => {
      if (!shopId) return null;
      try {
        let query = supabase
          .from("expenses")
          .select("type, amount")
          .match(filterByUUID('shop_id', shopId));

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

        const { data: expenses, error } = await query;

        if (error) {
          console.error("Error fetching expenses:", error);
          return null;
        }

        if (!expenses || !Array.isArray(expenses)) {
          return { total: 0, byType: {} };
        }

        // Defensive get functions (may be a row or an error, so check each)
        function getAmount(row: any) {
          return typeof row === "object" && row !== null && "amount" in row && typeof row.amount === "number" ? row.amount : 0;
        }
        function getType(row: any) {
          return typeof row === "object" && row !== null && "type" in row && typeof row.type === "string" ? row.type : "";
        }

        const total = expenses.reduce((acc, curr) => acc + getAmount(curr), 0);

        const byType = expenses.reduce((acc: Record<string, number>, curr) => {
          const type = getType(curr);
          const amount = getAmount(curr);
          if (type) {
            acc[type] = (acc[type] || 0) + amount;
          }
          return acc;
        }, {});

        return { total, byType };
      } catch (error) {
        console.error("Error processing expenses data:", error);
        return null;
      }
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
