import { AppLayout } from "@/components/Layout/AppLayout";
import { InvoiceList } from "@/components/Invoices/InvoiceList";
import { InvoiceFilters } from "@/components/Invoices/InvoiceFilters";
import { useState } from "react";

const Invoices = () => {
  const [dateFilter, setDateFilter] = useState<"all" | "daily" | "monthly">("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        </div>
        
        <InvoiceFilters
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
        
        <InvoiceList
          dateFilter={dateFilter}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </AppLayout>
  );
};

export default Invoices;