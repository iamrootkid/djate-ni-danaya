import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { DashboardCards } from "@/components/Dashboard/DashboardCards";
import { DashboardInvoices } from "@/components/Dashboard/DashboardInvoices";
import { ProductStockStatus } from "@/components/Dashboard/ProductStockStatus";
import { DateFilter, UserRole } from "@/types/invoice";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDashboardSales } from "@/hooks/use-dashboard-sales";
import { FiTrendingUp } from "react-icons/fi";

interface FiltersType {
  statsPeriod: DateFilter;
  salesPeriod: DateFilter;
  statsStartDate: Date;
  salesStartDate: Date;
  autoRefresh: boolean;
}

interface ErrorsType {
  stats?: boolean;
  sales?: boolean;
}

interface LoadingType {
  stats?: boolean;
  sales?: boolean;
}

interface DashboardContentProps {
  stats: any;
  salesData: any;
  isAdmin: boolean;
  userRole: UserRole;
  loading: LoadingType;
  errors: ErrorsType;
  filters: FiltersType;
  dateFilter: DateFilter;
  startDate: Date;
  shopId: string;
  handleFilterChange: (filter: DateFilter) => void;
  setStartDate: (date: Date) => void;
}

const SalesOverview = ({ dateFilter, startDate, shopId }: { dateFilter: DateFilter; startDate: Date; shopId: string }) => {
  const { data: salesData, isLoading } = useDashboardSales(dateFilter, startDate);

  const chartData = salesData?.map(sale => ({
    date: sale.date,
    total: sale.total
  })) || [];

  // Calculate total sales
  const totalSales = chartData.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <Card className="h-full p-4">
      <CardHeader>
        <CardTitle>Aperçu des ventes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-muted-foreground text-sm">Total ventes:</span>
          <span
            className="inline-flex items-center ml-2 px-4 py-2 rounded-xl shadow-lg bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 text-white text-3xl font-extrabold tracking-tight animate-pulse"
            style={{
              boxShadow: '0 4px 24px 0 rgba(124,58,237,0.25), 0 1.5px 4px 0 rgba(255,193,7,0.10)'
            }}
          >
            <FiTrendingUp className="mr-2 text-4xl drop-shadow-lg" />
            {totalSales.toLocaleString()} F CFA
          </span>
        </div>
        <div className="w-full" style={{ minHeight: 350 }}>
          {isLoading ? (
            <div className="flex justify-center items-center h-[350px]">Chargement...</div>
          ) : !chartData || chartData.length === 0 ? (
            <div className="flex justify-center items-center h-[350px]">Aucune donnée de vente disponible</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 50, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 13 }} />
                <YAxis 
                  tickFormatter={(value) => value.toLocaleString() + ' F'}
                />
                <Tooltip 
                  formatter={(value: number) => `${value.toLocaleString()} F CFA`}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="total" fill="#7C3AED" name="Montant total" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DashboardContent = ({
  stats,
  salesData,
  isAdmin,
  userRole,
  loading,
  errors,
  filters,
  dateFilter,
  startDate,
  shopId,
  handleFilterChange,
  setStartDate,
}: DashboardContentProps) => {
  const safeFilters = filters || {
    statsPeriod: 'daily' as DateFilter,
    salesPeriod: 'daily' as DateFilter,
    statsStartDate: new Date(),
    salesStartDate: new Date(),
    autoRefresh: true
  };
  const isLoading = loading?.stats || false;

  return (
    <div className="space-y-6">
      <DashboardHeader 
        dateFilter={dateFilter}
        startDate={startDate}
        handleFilterChange={handleFilterChange}
        setStartDate={setStartDate}
        userRole={userRole}
      />

      <div className="w-full">
        {isLoading ? (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[140px]" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DashboardCards stats={stats} />
          </motion.div>
        )}
      </div>

      {/* Stack Aperçu des ventes above Produits à faible stock */}
      <div className="grid grid-cols-1 gap-6">
        <SalesOverview
          dateFilter={dateFilter}
          startDate={startDate}
          shopId={shopId}
        />
        <ProductStockStatus />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <DashboardInvoices 
          dateFilter={dateFilter} 
          startDate={startDate}
        />
      </div>
    </div>
  );
};
