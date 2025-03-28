
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockSummary as StockSummaryType } from "@/integrations/supabase/types/functions";
import { ArrowUp, ArrowDown, DollarSign, Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useStockSummary } from "@/hooks/use-stock-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { DateFilter } from "@/types/invoice";

interface StockSummaryProps {
  startDate: Date;
  dateFilter: DateFilter;
}

export const StockSummary = ({ startDate, dateFilter }: StockSummaryProps) => {
  const { data: summary, isLoading } = useStockSummary(startDate, dateFilter);

  // Calculate net stock change
  const netStockChange = (summary?.stock_in || 0) - (summary?.stock_out || 0);
  const isStockIncreasing = netStockChange >= 0;

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
        <Badge variant={summary?.profit && summary.profit > 0 ? "success" : "destructive"}>
          {summary?.profit ? (summary.profit > 0 ? "+" : "") + summary.profit.toLocaleString() + " F CFA" : "0 F CFA"}
        </Badge>
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
