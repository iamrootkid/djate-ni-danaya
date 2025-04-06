
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package, BarChart } from "lucide-react";
import { DateFilter } from "@/types/invoice";
import { useStockSummary } from "@/hooks/use-stock-summary";
import { format } from "date-fns";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

// Adding StatCard component for each stat
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
}

const StatCard = ({ title, value, icon, description }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

export function SalesStats() {
  const queryClient = useQueryClient();
  
  // Today's date in ISO format for the API
  const today = new Date();
  const todayFormatted = format(today, "yyyy-MM-dd");
  
  // We need to get daily sales stats
  const { data: stockSummary, isLoading } = useStockSummary(today, "daily");
  
  // Use default values if data is loading or not available
  const totalIncome = stockSummary?.total_income || 0;
  const totalExpenses = stockSummary?.total_expenses || 0;
  const stockIn = stockSummary?.stock_in || 0;
  const stockOut = stockSummary?.stock_out || 0;
  
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

    // Clean up subscriptions when component unmounts
    return () => {
      supabase.removeChannel(salesChannel);
      supabase.removeChannel(saleItemsChannel);
    };
  }, [queryClient]);
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Ventes du jour"
        value={`${totalIncome.toLocaleString()} F CFA`}
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Achats du jour"
        value={`${totalExpenses.toLocaleString()} F CFA`}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Entrées de stock"
        value={stockIn.toString()}
        icon={<Package className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Sorties de stock"
        value={stockOut.toString()}
        icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}

// Make sure to export the component both as default and named export
export default SalesStats;
