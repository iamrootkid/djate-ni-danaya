import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useShopId } from "@/hooks/use-shop-id";

interface FinancialReportProps {
  dateRange: DateRange;
}

type Invoice = {
  id: string;
  created_at: string;
  sales: {
    total_amount: number;
  } | null;
  is_modified: boolean;
  new_total_amount: number | null;
};

type ChartData = {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
};

export const FinancialReport = ({ dateRange }: FinancialReportProps) => {
  const { shopId } = useShopId();

  const { data: financialData, isLoading } = useQuery<ChartData[]>({
    queryKey: ["financial-report", dateRange, shopId],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to || !shopId) return [];
      
      // Get sales data
      const { data: invoices, error: salesError } = await supabase
        .from("invoices")
        .select(`
          id,
          created_at,
          sales (
            total_amount
          ),
          is_modified,
          new_total_amount
        `)
        .eq("shop_id", shopId)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order("created_at")
        .returns<Invoice[]>();
      
      if (salesError) throw salesError;
      
      // Get expenses data
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("date, amount")
        .eq("shop_id", shopId)
        .gte('date', dateRange.from.toISOString())
        .lte('date', dateRange.to.toISOString())
        .order("date");
      
      if (expensesError) throw expensesError;
      
      // Process data for chart
      const dateMap = new Map<string, ChartData>();
      
      if (invoices) {
        invoices.forEach(invoice => {
          const date = new Date(invoice.created_at).toLocaleDateString();
          const currentData = dateMap.get(date) || { date, revenue: 0, expenses: 0, profit: 0 };
          const amount = invoice.is_modified && invoice.new_total_amount !== undefined
            ? invoice.new_total_amount
            : invoice.sales?.total_amount || 0;
          currentData.revenue += Number(amount);
          currentData.profit = currentData.revenue - currentData.expenses;
          dateMap.set(date, currentData);
        });
      }
      
      if (expensesData) {
        expensesData.forEach(expense => {
          const date = new Date(expense.date).toLocaleDateString();
          const currentData = dateMap.get(date) || { date, revenue: 0, expenses: 0, profit: 0 };
          currentData.expenses += Number(expense.amount);
          currentData.profit = currentData.revenue - currentData.expenses;
          dateMap.set(date, currentData);
        });
      }
      
      return Array.from(dateMap.values());
    },
    enabled: !!dateRange.from && !!dateRange.to && !!shopId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rapport financier</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={financialData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toLocaleString()} F CFA`]} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenus" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="expenses" name="Dépenses" stroke="#ff8042" />
                  <Line type="monotone" dataKey="profit" name="Profit" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="text-sm font-medium">Revenus totaux</h3>
                <p className="text-2xl font-bold">
                  {financialData?.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()} F CFA
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="text-sm font-medium">Dépenses totales</h3>
                <p className="text-2xl font-bold">
                  {financialData?.reduce((sum, item) => sum + item.expenses, 0).toLocaleString()} F CFA
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="text-sm font-medium">Profit net</h3>
                <p className="text-2xl font-bold">
                  {financialData?.reduce((sum, item) => sum + item.profit, 0).toLocaleString()} F CFA
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
