
import { DashboardCards } from "@/components/Dashboard/DashboardCards";
import { SalesChart } from "@/components/Dashboard/SalesChart";
import { RecentOrders } from "@/components/Dashboard/RecentOrders";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { DashboardInvoices } from "@/components/Dashboard/DashboardInvoices";
import { ProductStockStatus } from "@/components/Dashboard/ProductStockStatus";
import { BestSellingProducts } from "@/components/Dashboard/BestSellingProducts";
import { DateFilter } from "@/types/invoice";

interface DashboardContentProps {
  dateFilter: DateFilter;
  startDate: Date;
  userRole: "admin" | "employee";
  stats: any; // Using any for brevity, but should be properly typed
  recentOrders: any[]; // Using any[] for brevity, but should be properly typed
  handleFilterChange: (filter: DateFilter) => void;
  setStartDate: (date: Date) => void;
}

export function DashboardContent({
  dateFilter,
  startDate,
  userRole,
  stats,
  recentOrders,
  handleFilterChange,
  setStartDate
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
      
      {stats && <DashboardCards stats={stats} />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <SalesChart dateFilter={dateFilter} startDate={startDate} />
        <DashboardInvoices dateFilter={dateFilter} startDate={startDate} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ProductStockStatus />
        <BestSellingProducts dateFilter={dateFilter} startDate={startDate} />
      </div>

      <RecentOrders orders={recentOrders || []} />
    </div>
  );
}
