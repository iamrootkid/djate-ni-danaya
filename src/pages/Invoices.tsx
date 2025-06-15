
import { AppLayout } from "@/components/Layout/AppLayout";
import { InvoiceList } from "@/components/Invoices/InvoiceList";
import { InvoiceFilters } from "@/components/Invoices/InvoiceFilters";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { useInvoiceSubscriptions } from "@/hooks/invoices/use-invoice-subscriptions";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";

const Invoices = () => {
  const [dateFilter, setDateFilter] = useState<"all" | "daily" | "monthly">("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  const isMobile = useIsMobile();
  
  // Use the subscription hook to set up real-time updates
  useInvoiceSubscriptions(shopId);

  return (
    <AppLayout>
      <div className={isMobile ? "space-y-4 p-2" : "space-y-6"}>
        <Card className={isMobile ? "bg-white dark:bg-[#18181b] rounded-xl shadow-sm" : undefined}>
          <CardContent className={isMobile ? "p-4" : undefined}>
            <div className={isMobile ? "flex flex-col gap-4" : "flex justify-between items-center"}>
              <h2 className="tracking-tight mx-0 my-0 text-2xl font-extrabold text-foreground">Factures</h2>
              <InvoiceFilters
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
              />
            </div>
          </CardContent>
        </Card>
        <InvoiceList dateFilter={dateFilter} startDate={startDate} endDate={endDate} />
      </div>
    </AppLayout>
  );
};

export default Invoices;
