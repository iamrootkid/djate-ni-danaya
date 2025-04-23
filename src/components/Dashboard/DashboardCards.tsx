
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, DollarSign, TrendingUp, AlertTriangle, Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    // Format with thousands separators
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",").replace(/,/g, " ");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Produits</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.products}</div>
          <p className="text-xs text-muted-foreground">
            Produits en stock
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card dark:bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ventes</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.sales)} F CFA</div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Total des ventes
            </p>
            <Badge variant={isProfitable ? "success" : "destructive"} className="text-xs">
              {profit > 0 ? "+" : ""}{formatNumber(profit)} F CFA
            </Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Personnel</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.staff}</div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Employés actifs
            </p>
            <Badge variant="outline" className="text-xs">
              {Math.floor((stats.products || 0) / (stats.staff || 1))} produits/emp
            </Badge>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
          <Banknote className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.expenses.total)} F CFA</div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Total des dépenses
            </p>
            <Badge variant="outline" className="text-xs">
              Stock: {formatNumber(stats.expenses.stock)} F CFA
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
