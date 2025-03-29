
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSales, SalesData } from "@/hooks/use-dashboard-sales";
import { DateFilter } from "@/types/invoice";

interface SalesChartProps {
  dateFilter?: DateFilter;
  startDate?: Date;
}

export const SalesChart = ({ dateFilter = "all", startDate = new Date() }: SalesChartProps) => {
  const { data: salesData, isLoading, isError } = useDashboardSales(dateFilter, startDate);

  // Format numbers with appropriate spacing
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F";
  };

  // Get title description based on date filter
  const getChartDescription = () => {
    switch (dateFilter) {
      case "daily":
        return "Ventes par heure aujourd'hui";
      case "yesterday":
        return "Ventes par heure hier";
      case "monthly":
        return "Ventes quotidiennes ce mois";
      case "all":
      default:
        return "Tendance des ventes récentes";
    }
  };

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Aperçu des ventes</CardTitle>
          <CardDescription>{getChartDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Aperçu des ventes</CardTitle>
          <CardDescription>{getChartDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Erreur lors du chargement des données de vente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Aperçu des ventes</CardTitle>
        <CardDescription>{getChartDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8884d8" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#8884d8" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
            />
            <Tooltip
              formatter={(value: number) => [formatNumber(value), "Total"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#8884d8"
              strokeWidth={2}
              fill="url(#total)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
