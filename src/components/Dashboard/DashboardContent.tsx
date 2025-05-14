
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { DashboardCards } from "@/components/Dashboard/DashboardCards";
import { DashboardInvoices } from "@/components/Dashboard/DashboardInvoices";
import { RecentOrders } from "@/components/Dashboard/RecentOrders";
import { StockSummary } from "@/components/Dashboard/StockSummary";
import { ProductStockStatus } from "@/components/Dashboard/ProductStockStatus";
import { DateFilter, UserRole } from "@/types/invoice";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Order } from "@/types/order";

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
  // Add these actual handlers/props:
  dateFilter: DateFilter;
  startDate: Date;
  handleFilterChange: (filter: DateFilter) => void;
  setStartDate: (date: Date) => void;
}

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
  handleFilterChange,
  setStartDate,
}: DashboardContentProps) => {
  // Ensure filters are defined with defaults
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
      
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        <StockSummary
          dateFilter={dateFilter}
          startDate={startDate}
          userRole={userRole}
        />
        <ProductStockStatus />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardInvoices 
          dateFilter={dateFilter} 
          startDate={startDate}
          className="col-span-3"
        />
        <RecentOrders orders={[]} />
      </div>
    </div>
  );
};
