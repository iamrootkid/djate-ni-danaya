import { AppLayout } from "@/components/Layout/AppLayout";
import { InvoiceList } from "@/components/Invoices/InvoiceList";
import { InvoiceFilters } from "@/components/Invoices/InvoiceFilters";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useShopId } from "@/hooks/use-shop-id";
const Invoices = () => {
  const [dateFilter, setDateFilter] = useState<"all" | "daily" | "monthly">("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const {
    shopId
  } = useShopId();

  // Set up real-time listeners for stock and invoice updates
  useEffect(() => {
    if (!shopId) return;
    const channel = supabase.channel('stock-and-invoice-updates').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'invoice_modifications',
      filter: `shop_id=eq.${shopId}`
    }, payload => {
      console.log("Invoice modification detected:", payload);

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['invoices']
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard-stats']
      });
      queryClient.invalidateQueries({
        queryKey: ['products-stock']
      });

      // Show toast notification
      if (payload.eventType === 'INSERT') {
        const newRecord = payload.new as any;
        if (newRecord.modification_type === 'return') {
          toast({
            title: "Stock Updated",
            description: "Items returned have been added back to inventory"
          });
        } else {
          toast({
            title: "Invoice Modified",
            description: "Invoice information has been updated"
          });
        }
      }
    }).on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'products',
      filter: `shop_id=eq.${shopId}`
    }, () => {
      // Refresh product-related data
      queryClient.invalidateQueries({
        queryKey: ['products-stock']
      });
      queryClient.invalidateQueries({
        queryKey: ['inventory-report']
      });
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, queryClient, toast]);
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