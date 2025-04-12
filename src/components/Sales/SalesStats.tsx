
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package, Users, ShoppingCart, ChevronUp, ChevronDown } from "lucide-react";
import { DateFilter } from "@/types/invoice";
import { useStockSummary } from "@/hooks/use-stock-summary";
import { format, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useShopId } from "@/hooks/use-shop-id";

// Adding StatCard component for each stat
interface StatCardProps {
  title: string;
  value: string | JSX.Element;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral',
    value: string
  };
  isLoading?: boolean;
}

const StatCard = ({ title, value, icon, description, trend, isLoading = false }: StatCardProps) => (
  <Card className="overflow-hidden transition-all hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="p-1.5 bg-background rounded-full shadow-sm">{icon}</div>
    </CardHeader>
    <CardContent className="pt-4">
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-4 w-32" />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          {(description || trend) && (
            <div className="flex items-center justify-between mt-2">
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
              {trend && (
                <Badge variant={trend.direction === 'up' ? 'default' : trend.direction === 'down' ? 'destructive' : 'outline'} className="text-xs">
                  {trend.direction === 'up' ? (
                    <ChevronUp className="mr-1 h-3 w-3" />
                  ) : trend.direction === 'down' ? (
                    <ChevronDown className="mr-1 h-3 w-3" />
                  ) : null}
                  {trend.value}
                </Badge>
              )}
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

export function SalesStats() {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  
  // Today's date in ISO format for the API
  const today = new Date();
  const todayFormatted = format(today, "yyyy-MM-dd");
  const startOfToday = startOfDay(today).toISOString();
  
  // We need to get daily sales stats
  const { data: stockSummary, isLoading: summaryLoading } = useStockSummary(today, "daily");
  
  // Get client count - updated to correctly count distinct customers
  const { data: clientCount, isLoading: clientsLoading } = useQuery({
    queryKey: ["client-count", shopId, todayFormatted],
    queryFn: async () => {
      if (!shopId) return { count: 0, today: 0 };
      
      // Get total unique customers
      const { data: totalClients, error: totalError } = await supabase
        .from("invoices")
        .select("customer_name")
        .eq("shop_id", shopId)
        .not("customer_name", "eq", "");
      
      // Count distinct customers
      const uniqueTotalCustomers = new Set(
        totalClients?.map(invoice => invoice.customer_name.toLowerCase().trim())
      ).size;
      
      // Get today's unique customers
      const { data: todayClients, error: todayError } = await supabase
        .from("invoices")
        .select("customer_name")
        .eq("shop_id", shopId)
        .not("customer_name", "eq", "")
        .gte("created_at", startOfToday);
      
      // Count distinct today's customers
      const uniqueTodayCustomers = new Set(
        todayClients?.map(invoice => invoice.customer_name.toLowerCase().trim())
      ).size;
      
      if (totalError || todayError) {
        console.error("Error fetching client counts:", totalError || todayError);
      }
      
      return {
        count: uniqueTotalCustomers || 0,
        today: uniqueTodayCustomers || 0
      };
    },
    enabled: !!shopId
  });
  
  // Get transaction count - updated to correctly count today's transactions
  const { data: transactionCount, isLoading: transactionsLoading } = useQuery({
    queryKey: ["transaction-count", shopId, todayFormatted],
    queryFn: async () => {
      if (!shopId) return { count: 0, today: 0 };
      
      const { count: totalTransactions, error: totalError } = await supabase
        .from("sales")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", shopId);
      
      const { count: todayTransactions, error: todayError } = await supabase
        .from("sales")
        .select("id", { count: "exact", head: true })
        .eq("shop_id", shopId)
        .gte("created_at", startOfToday);
      
      if (totalError || todayError) {
        console.error("Error fetching transaction counts:", totalError || todayError);
      }
      
      return {
        count: totalTransactions || 0,
        today: todayTransactions || 0
      };
    },
    enabled: !!shopId
  });
  
  // Subscribe to real-time updates for sales and inventory changes
  useEffect(() => {
    // Set up subscriptions for sales and inventory changes
    const salesChannel = supabase
      .channel('sales-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        () => {
          console.log('Sales data changed, refreshing stats...');
          queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
          queryClient.invalidateQueries({ queryKey: ['transaction-count'] });
        }
      )
      .subscribe();
      
    const invoicesChannel = supabase
      .channel('invoices-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'invoices' },
        () => {
          console.log('Invoices changed, refreshing stats...');
          queryClient.invalidateQueries({ queryKey: ['client-count'] });
        }
      )
      .subscribe();
      
    const saleItemsChannel = supabase
      .channel('sale-items-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sale_items' },
        () => {
          console.log('Sale items changed, refreshing stats...');
          queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
        }
      )
      .subscribe();
      
    const expensesChannel = supabase
      .channel('expenses-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          console.log('Expenses changed, refreshing stats...');
          queryClient.invalidateQueries({ queryKey: ['stock-summary'] });
        }
      )
      .subscribe();

    // Clean up subscriptions when component unmounts
    return () => {
      supabase.removeChannel(salesChannel);
      supabase.removeChannel(invoicesChannel);
      supabase.removeChannel(saleItemsChannel);
      supabase.removeChannel(expensesChannel);
    };
  }, [queryClient]);
  
  // Use default values if data is loading or not available
  const totalIncome = stockSummary?.total_income || 0;
  const totalExpenses = stockSummary?.total_expenses || 0;
  const stockIn = stockSummary?.stock_in || 0;
  const stockOut = stockSummary?.stock_out || 0;
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Ventes du jour"
        value={`${totalIncome.toLocaleString()} F CFA`}
        icon={<TrendingUp className="h-4 w-4 text-green-500" />}
        description="Total des ventes aujourd'hui"
        trend={totalIncome > 0 ? { direction: 'up', value: '+' + (totalIncome / 1000).toFixed(1) + 'K' } : undefined}
        isLoading={summaryLoading}
      />
      
      <StatCard
        title="Achats du jour"
        value={`${totalExpenses.toLocaleString()} F CFA`}
        icon={<DollarSign className="h-4 w-4 text-blue-500" />}
        description="Total des dépenses aujourd'hui"
        isLoading={summaryLoading}
      />
      
      <StatCard
        title="Clients"
        value={
          <>
            {clientCount?.count?.toLocaleString() || "0"}
            <Badge variant="outline" className="ml-2 text-xs">
              +{clientCount?.today || 0} aujourd'hui
            </Badge>
          </>
        }
        icon={<Users className="h-4 w-4 text-indigo-500" />}
        isLoading={clientsLoading}
      />
      
      <StatCard
        title="Transactions"
        value={
          <>
            {transactionCount?.count?.toLocaleString() || "0"}
            <Badge variant="outline" className="ml-2 text-xs">
              +{transactionCount?.today || 0} aujourd'hui
            </Badge>
          </>
        }
        icon={<ShoppingCart className="h-4 w-4 text-amber-500" />}
        isLoading={transactionsLoading}
      />
    </div>
  );
}

export default SalesStats;
