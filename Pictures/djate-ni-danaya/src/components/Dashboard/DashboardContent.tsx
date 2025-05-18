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
  const safeFilters = filters || {
    statsPeriod: 'daily' as DateFilter,
    salesPeriod: 'daily' as DateFilter,
    statsStartDate: new Date(),
    salesStartDate: new Date(),
    autoRefresh: true
  };
  const isLoading = loading?.stats || false;

  return (
    <>
      {/* Desktop Layout - Hidden on Mobile */}
      <div className="hidden md:block space-y-6">
        <DashboardHeader 
          dateFilter={dateFilter}
          startDate={startDate}
          handleFilterChange={handleFilterChange}
          setStartDate={setStartDate}
          userRole={userRole}
        />

        <div className="w-full">
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
        </div>

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

      {/* Mobile Layout - Hidden on Desktop */}
      <div className="md:hidden min-h-screen bg-[#f6f7fa]">
        {/* Date Filter - Mobile Version */}
        <div className="px-4 mb-3">
          <DashboardHeader 
            dateFilter={dateFilter}
            startDate={startDate}
            handleFilterChange={handleFilterChange}
            setStartDate={setStartDate}
            userRole={userRole}
          />
        </div>

        {/* Stats Cards - 2x2 Grid on Mobile */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                  <Skeleton className="h-[100px]" />
                </div>
              ))
            ) : (
              <DashboardCards stats={stats} />
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="px-4 mb-4">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[#222]">Produits à faible stock</h2>
              <button className="p-2 text-[#888] hover:bg-gray-50 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <ProductStockStatus limit={5} />
            </div>
          </div>
        </div>

        {/* Invoices - Mobile Version */}
        <div className="px-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-[#222]">Factures récentes</h2>
            </div>
            <div className="p-4">
              <DashboardInvoices 
                dateFilter={dateFilter} 
                startDate={startDate}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
