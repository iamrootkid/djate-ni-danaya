import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceTable } from "./InvoiceTable";
import { useDashboardInvoices } from "@/hooks/invoices/use-dashboard-invoices";
import { DateFilter } from "@/types/invoice";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { safeQueryResult } from "@/utils/safeFilters";

// Create a new interface that makes sale_id optional
export interface DashboardInvoiceData {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  created_at: string;
  total_amount: number;
  employee_email: string;
  is_modified?: boolean;
  new_total_amount?: number;
  sale_id?: string; // Made optional for dashboard view
}

interface DashboardInvoicesProps {
  dateFilter: DateFilter;
  startDate: Date;
  className?: string;
}

export const DashboardInvoices = ({ dateFilter, startDate, className }: DashboardInvoicesProps) => {
  console.log('DashboardInvoices render:', { dateFilter, startDate });
  const { data: invoiceResults, isLoading, error } = useDashboardInvoices(dateFilter, startDate);
  
  // Process and validate invoice data
  const invoices = safeQueryResult<DashboardInvoiceData[]>(invoiceResults, []);
  
  useEffect(() => {
    if (error) {
      console.error("Error in DashboardInvoices:", error);
    }
    if (invoices) {
      console.log("Invoices loaded:", invoices.length, "invoices found");
    }
  }, [invoices, error]);

  // Get title based on date filter
  const getTitle = () => {
    switch (dateFilter) {
      case "daily":
        return "Factures d'aujourd'hui";
      case "yesterday":
        return "Factures d'hier";
      case "monthly":
        return "Factures du mois";
      case "all":
      default:
        return "Dernières factures";
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <InvoiceTable invoices={invoices} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};
