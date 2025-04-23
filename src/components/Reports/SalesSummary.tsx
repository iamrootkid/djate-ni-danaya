import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSalesReport } from "@/hooks/use-sales-report";
import { DateRange } from "react-day-picker";

interface SalesSummaryProps {
  dateRange: DateRange;
}

export const SalesSummary = ({ dateRange }: SalesSummaryProps) => {
  const { data: salesData } = useSalesReport(dateRange);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Résumé des ventes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="text-sm font-medium">Ventes totales</h3>
            <p className="text-2xl font-bold">
              {salesData?.reduce((acc, sale) => acc + Number(sale.total_amount), 0).toLocaleString()} F CFA
            </p>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="text-sm font-medium">Vente moyenne</h3>
            <p className="text-2xl font-bold">
              {(salesData?.reduce((acc, sale) => acc + Number(sale.total_amount), 0) / (salesData?.length || 1)).toLocaleString()} F CFA
            </p>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="text-sm font-medium">Transactions totales</h3>
            <p className="text-2xl font-bold">{salesData?.length || 0}</p>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg">
            <h3 className="text-sm font-medium">Ventes en cours</h3>
            <p className="text-2xl font-bold">
              {salesData?.filter(sale => {
                const isPending = sale.created_at && 
                  (new Date().getTime() - new Date(sale.created_at).getTime() < 24 * 60 * 60 * 1000);
                return isPending;
              }).length || 0}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
