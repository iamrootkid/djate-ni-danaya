
import { DashboardCards } from "@/components/Dashboard/DashboardCards";
import { SalesChart } from "@/components/Dashboard/SalesChart";
import { RecentOrders } from "@/components/Dashboard/RecentOrders";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { DashboardInvoices } from "@/components/Dashboard/DashboardInvoices";
import { ProductStockStatus } from "@/components/Dashboard/ProductStockStatus";
import { DateFilter } from "@/types/invoice";
import { Skeleton } from "@/components/ui/skeleton";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicMetric } from "@/components/Dashboard/DynamicMetric";
import { motion } from "framer-motion";

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

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

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
        <motion.div 
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          {stats && <DashboardCards stats={stats} />}

          <DynamicMetric dateFilter={dateFilter} />

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="details">Détails</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <ResizablePanelGroup direction="horizontal" className="min-h-[500px] rounded-lg border">
                <ResizablePanel defaultSize={65} minSize={40}>
                  <div className="p-4 h-full">
                    <SalesChart dateFilter={dateFilter} startDate={startDate} />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={35} minSize={30}>
                  <div className="p-4 h-full">
                    <DashboardInvoices dateFilter={dateFilter} startDate={startDate} />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabsContent>
            
            <TabsContent value="details">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-3 lg:col-span-3">
                  <ProductStockStatus />
                </div>
                <div className="col-span-4 lg:col-span-4">
                  <RecentOrders orders={Array.isArray(recentOrders) ? recentOrders : []} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
}
