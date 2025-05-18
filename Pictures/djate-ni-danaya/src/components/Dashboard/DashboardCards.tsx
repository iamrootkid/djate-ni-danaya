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

  // Mobile view content
  const MobileContent = () => (
    <div className="grid grid-cols-2 gap-x-4 gap-y-4 w-full">
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <Package className="h-5 w-5 text-[#666]" />
        </div>
        <div className="text-2xl font-bold text-[#222] mb-2">{stats.products}</div>
        <div className="text-sm text-[#666] mb-1">Produits</div>
        <div className="text-xs text-[#888]">Produits en stock</div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <DollarSign className="h-5 w-5 text-[#666]" />
        </div>
        <div className="text-2xl font-bold text-[#222] mb-2">{formatNumber(stats.sales)} F CFA</div>
        <div className="text-sm text-[#666] mb-1">Ventes</div>
        <div className="text-xs text-[#888]">Total des ventes</div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <Users className="h-5 w-5 text-[#666]" />
        </div>
        <div className="text-2xl font-bold text-[#222] mb-2">{stats.staff}</div>
        <div className="text-sm text-[#666] mb-1">Personnel</div>
        <div className="text-xs text-[#888]">Employés actifs</div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <Banknote className="h-5 w-5 text-[#666]" />
        </div>
        <div className="text-2xl font-bold text-[#222] mb-2">{formatNumber(stats.expenses.total)} F CFA</div>
        <div className="text-sm text-[#666] mb-1">Dépenses</div>
        <div className="text-xs text-[#888]">Total des dépenses</div>
      </div>
    </div>
  );

  // Desktop view content
  const DesktopContent = () => (
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
            <Badge className={cn(
              "text-xs", 
              isProfitable ? "bg-green-500 text-white" : "bg-destructive text-destructive-foreground"
            )}>
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
            <Badge className="text-xs bg-secondary text-secondary-foreground">
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
            <Badge className="text-xs bg-secondary text-secondary-foreground">
              Stock: {formatNumber(stats.expenses.stock)} F CFA
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <div className="md:hidden">
        <MobileContent />
      </div>
      <div className="hidden md:block">
        <DesktopContent />
      </div>
    </>
  );
};
