import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, DollarSign, TrendingUp, AlertTriangle, Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DashboardCardsProps {
  stats: {
    products: number;
    sales: number;
    staff: number;
    growth: string;
    expenses: {
      total: number;
      stock: number;
    };
  };
}

export const DashboardCards = ({ stats }: DashboardCardsProps) => {
  // Calculate profit by subtracting expenses from sales
  const profit = stats.sales - stats.expenses.total;
  const isProfitable = profit > 0;

  // Format large numbers with appropriate spacing
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",").replace(/,/g, " ");
  };

  return (
    <div className="grid gap-4 grid-cols-2">
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">Produits</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-card-foreground">{stats.products}</div>
          <p className="text-xs text-muted-foreground">
            Produits en stock
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">Ventes</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-card-foreground">{formatNumber(stats.sales)} F CFA</div>
          <p className="text-xs text-muted-foreground">
            Total des ventes
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">Personnel</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-card-foreground">{stats.staff}</div>
          <p className="text-xs text-muted-foreground">
            Employés actifs
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-card-foreground">Dépenses</CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-card-foreground">{formatNumber(stats.expenses.total)} F CFA</div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Total des dépenses
            </p>
            <Badge className="text-xs bg-secondary text-secondary-foreground">
              Stock: {formatNumber(stats.expenses.stock)} F CFA
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
