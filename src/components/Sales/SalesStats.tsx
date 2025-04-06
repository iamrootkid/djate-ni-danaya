
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Package, BarChart } from "lucide-react";
import { DateFilter } from "@/types/invoice";
import { useStockSummary } from "@/hooks/use-stock-summary";
import { format } from "date-fns";

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
  // Today's date in ISO format for the API
  const today = new Date();
  const todayFormatted = format(today, "yyyy-MM-dd");
  
  // We need to get daily sales stats
  const { data: stockSummary, isLoading } = useStockSummary("daily", today);
  
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
