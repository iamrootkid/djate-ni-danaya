
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { DashboardCards } from "@/components/Dashboard/DashboardCards";
import { DashboardInvoices } from "@/components/Dashboard/DashboardInvoices";
import { RecentOrders } from "@/components/Dashboard/RecentOrders";
import { StockSummary } from "@/components/Dashboard/StockSummary";
import { ProductStockStatus } from "@/components/Dashboard/ProductStockStatus";
import { DateFilter } from "@/types/invoice";
import { UserRole } from "@/types/invoice";
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
}

export const DashboardContent = ({
  stats,
  salesData,
  isAdmin,
  userRole,
  loading,
  errors,
  filters
}: DashboardContentProps) => {
  // Ensure filters are defined with defaults
  const safeFilters = filters || {
    statsPeriod: 'daily' as DateFilter,
    salesPeriod: 'daily' as DateFilter,
    statsStartDate: new Date(),
    salesStartDate: new Date(),
    autoRefresh: true
  };
  
  const { statsPeriod, statsStartDate } = safeFilters;
  const isLoading = loading?.stats || false;
  
  return (
    <div className="space-y-6">
      <DashboardHeader 
        dateFilter={statsPeriod} 
        startDate={statsStartDate}
        handleFilterChange={(filter) => {
          // This is just a placeholder for component props
          console.log("Filter changed:", filter);
        }}
        setStartDate={(date) => {
          // This is just a placeholder for component props
          console.log("Date changed:", date);
        }}
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
          dateFilter={statsPeriod}
          startDate={statsStartDate}
          userRole={userRole}
        />
        <ProductStockStatus />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardInvoices 
          dateFilter={statsPeriod} 
          startDate={statsStartDate} 
          className="col-span-3"
        />
        <RecentOrders orders={[]} />
      </div>
    </div>
  );
};
