
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockSummary as StockSummaryType } from "@/integrations/supabase/types/functions";
import { ArrowUp, ArrowDown, DollarSign, Banknote, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStockSummary } from "@/hooks/use-stock-summary";
import { DateFilter } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { useToast } from "@/components/ui/use-toast";
import { UserRole } from "@/types/user";

interface StockSummaryProps {
  startDate: Date;
  dateFilter: DateFilter;
  userRole: UserRole;
}

export const StockSummary = ({ startDate, dateFilter, userRole }: StockSummaryProps) => {
  // Convert 'all' to 'daily' when using useStockSummary
  const stockSummaryFilter = dateFilter === 'all' ? 'daily' : (dateFilter as 'daily' | 'monthly' | 'yesterday');
  const { data: summary, isLoading, error, refetch } = useStockSummary(startDate, stockSummaryFilter);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  const { toast } = useToast();

  // Calculate net stock change
  const netStockChange = (summary?.stock_in || 0) - (summary?.stock_out || 0);
  const isStockIncreasing = netStockChange >= 0;

  // Set up real-time subscription for stock changes
  useEffect(() => {
    if (!shopId) return;

    const channels = [
      // Listen for invoice modifications (returns)
      supabase
        .channel('stock-modifications')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'invoice_modifications',
            filter: `shop_id=eq.${shopId}`
          },
          async (payload) => {
            if (payload.eventType === 'INSERT' && (payload.new as any).modification_type === 'return') {
              console.log("Stock return detected:", payload);
              await refetch();
              
              toast({
                title: "Stock mis à jour",
                variant: "default"
              });
            }
          }
        )
        .subscribe(),

      // Listen for product stock changes
      supabase
        .channel('stock-updates')
        .on(
          'postgres_changes',
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'products',
            filter: `shop_id=eq.${shopId}`
          },
          () => {
            console.log("Product stock updated");
            refetch();
          }
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [shopId, refetch, toast]);

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
        queryClient.invalidateQueries({ queryKey: ['inventory-report'] }),
      ]);
      await refetch();
    } catch (error) {
      console.error("Failed to refresh stock summary:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Résumé des stocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 font-semibold">
            Erreur lors de la récupération du résumé de stock.<br />
            {error.message}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Si le message mentionne "Could not choose the best candidate function",<br />
            veuillez demander à l'administrateur de la base de données de supprimer les fonctions dupliquées dans Supabase.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
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
    <Card>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2 p-3 bg-card rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <p className="text-sm font-medium text-card-foreground">Revenu total</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {(summary?.total_income || 0).toLocaleString()} F CFA
            </p>
          </div>
          <div className="space-y-2 p-3 bg-card rounded-lg">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-red-500" />
              <p className="text-sm font-medium text-card-foreground">Dépenses totales</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {(summary?.total_expenses || 0).toLocaleString()} F CFA
            </p>
          </div>
          <div className="space-y-2 p-3 bg-card rounded-lg">
            <div className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-medium text-card-foreground">Stock entrant</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {summary?.stock_in || 0} unités
              </p>
              {summary && 'recent_returns' in summary && summary.recent_returns && summary.recent_returns > 0 ? (
                <Badge variant="success" className="ml-2">
                  +{summary.recent_returns} retours
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="space-y-2 p-3 bg-card rounded-lg">
            <div className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-orange-500" />
              <p className="text-sm font-medium text-card-foreground">Stock sortant</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xl sm:text-2xl font-bold text-orange-600">
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
