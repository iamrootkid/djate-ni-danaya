
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockSummary as StockSummaryType } from "@/integrations/supabase/types/functions";
import { ArrowUp, ArrowDown, DollarSign, Banknote, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStockSummary } from "@/hooks/use-stock-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { DateFilter } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface StockSummaryProps {
  startDate: Date;
  dateFilter: DateFilter;
}

export const StockSummary = ({ startDate, dateFilter }: StockSummaryProps) => {
  const { data: summary, isLoading, refetch } = useStockSummary(startDate, dateFilter);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Calculate net stock change
  const netStockChange = (summary?.stock_in || 0) - (summary?.stock_out || 0);
  const isStockIncreasing = netStockChange >= 0;

  // Add auto-refresh functionality
  useEffect(() => {
    // Refresh data when component mounts or when dateFilter/startDate changes
    refetch();
  }, [dateFilter, startDate, refetch]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate all related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stock-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard_invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['products-stock'] }),
        queryClient.invalidateQueries({ queryKey: ['best-selling-products'] }),
      ]);
      await refetch();
    } catch (error) {
      console.error("Failed to refresh stock summary:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-xs">Actualiser</span>
          </Button>
          <Badge variant={summary?.profit && summary.profit > 0 ? "success" : "destructive"}>
            {summary?.profit ? (summary.profit > 0 ? "+" : "") + summary.profit.toLocaleString() + " F CFA" : "0 F CFA"}
          </Badge>
        </div>
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
