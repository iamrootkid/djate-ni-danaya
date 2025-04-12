
import { DashboardCards } from "@/components/Dashboard/DashboardCards";
import { SalesChart } from "@/components/Dashboard/SalesChart";
import { RecentOrders } from "@/components/Dashboard/RecentOrders";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { DashboardInvoices } from "@/components/Dashboard/DashboardInvoices";
import { ProductStockStatus } from "@/components/Dashboard/ProductStockStatus";
import { DateFilter } from "@/types/invoice";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardContentProps {
  dateFilter: DateFilter;
  startDate: Date;
  userRole: "admin" | "employee";
  stats: any; // Using any for brevity, but should be properly typed
  recentOrders: any[] | null | undefined; // Using any[] for brevity, but should be properly typed
  handleFilterChange: (filter: DateFilter) => void;
  setStartDate: (date: Date) => void;
  isLoading?: boolean;
}

export function DashboardContent({
  dateFilter,
  startDate,
  userRole,
  stats,
  recentOrders = [],
  handleFilterChange,
  setStartDate,
  isLoading = false
}: DashboardContentProps) {
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
        <div className="space-y-6">
          <Skeleton className="w-full h-28" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Skeleton className="col-span-4 h-80" />
            <Skeleton className="col-span-3 h-80" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Skeleton className="col-span-3 h-64" />
            <Skeleton className="col-span-3 h-64 lg:col-span-4" />
          </div>
          <Skeleton className="w-full h-72" />
        </div>
      ) : (
        <>
          {stats && <DashboardCards stats={stats} />}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <SalesChart dateFilter={dateFilter} startDate={startDate} />
            <DashboardInvoices dateFilter={dateFilter} startDate={startDate} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <ProductStockStatus />
          </div>

          <RecentOrders orders={Array.isArray(recentOrders) ? recentOrders : []} />
        </>
      )}
    </div>
  );
}

