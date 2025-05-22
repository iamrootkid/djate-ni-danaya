
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { filterByShopId } from "@/utils/safeFilters";
import { useShopId } from "@/hooks/use-shop-id";

export const FinancialReport = () => {
  const { shopId } = useShopId();
  
  const { data: expenses, isLoading, error } = useQuery({
    queryKey: ["expenses", shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const query = supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      
      // Apply shop filter if we have a shop ID
      const filteredQuery = filterByShopId(query, shopId);
      const { data, error } = await filteredQuery;

      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId,
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rapport financier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">
            Erreur lors du chargement du rapport financier
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rapport financier</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Process expense data for the chart
  const processedData = expenses?.reduce((acc: Record<string, number>, expense: any) => {
    const date = format(parseISO(expense.date), 'yyyy-MM-dd');
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {});

  // Convert to array format for Recharts
  const chartData = Object.keys(processedData || {}).map(date => ({
    date,
    amount: processedData?.[date] || 0,
  })).sort((a, b) => a.date.localeCompare(b.date));

  // Format currency
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' })
      .format(value)
      .replace('XOF', 'F CFA');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rapport financier</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#888888"
                />
                <YAxis 
                  tickFormatter={(value) => `${value} F`}
                  width={80}
                  stroke="#888888"
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), "Montant"]}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <p>Aucune donnée financière disponible</p>
            <p className="text-sm mt-2">Ajoutez des dépenses pour voir le rapport</p>
          </div>
        )}

        {expenses && expenses.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Détails des dépenses récentes</h3>
            <div className="border rounded-md">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-2 px-4 text-left">Date</th>
                    <th className="py-2 px-4 text-left">Description</th>
                    <th className="py-2 px-4 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.slice(0, 5).map((expense: any) => (
                    <tr key={expense.id} className="border-t">
                      <td className="py-2 px-4">{format(parseISO(expense.date), 'dd/MM/yyyy')}</td>
                      <td className="py-2 px-4">{expense.description || 'N/A'}</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(expense.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
