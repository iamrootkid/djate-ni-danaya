
import { AppLayout } from "@/components/Layout/AppLayout";
import { InvoiceList } from "@/components/Invoices/InvoiceList";
import { InvoiceFilters } from "@/components/Invoices/InvoiceFilters";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
import { useInvoiceSubscriptions } from "@/hooks/invoices/use-invoice-subscriptions";

const Invoices = () => {
  const [dateFilter, setDateFilter] = useState<"all" | "daily" | "monthly">("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  
  // Use the subscription hook to set up real-time updates
  useInvoiceSubscriptions(shopId);

  return <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="tracking-tight mx-0 my-0 text-3xl font-extrabold">Factures</h2>
        </div>
        
        <InvoiceFilters dateFilter={dateFilter} setDateFilter={setDateFilter} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
        
        <InvoiceList dateFilter={dateFilter} startDate={startDate} endDate={endDate} />
      </div>
    </AppLayout>;
};

export default Invoices;
