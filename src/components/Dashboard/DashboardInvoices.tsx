import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceTableSkeleton } from "./InvoiceTableSkeleton";
import { useDashboardInvoices } from "@/hooks/use-dashboard-invoices";

interface DashboardInvoicesProps {
  dateFilter: "all" | "daily" | "monthly" | "yesterday";
  startDate: Date;
}

export const DashboardInvoices = ({ dateFilter, startDate }: DashboardInvoicesProps) => {
  const { data: invoices, isLoading, error } = useDashboardInvoices(dateFilter, startDate);

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Dernières factures</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <InvoiceTableSkeleton />
        ) : error ? (
          <p className="text-destructive">Erreur lors du chargement des factures</p>
        ) : (
          <InvoiceTable invoices={invoices || []} isLoading={isLoading} />
        )}
      </CardContent>
    </Card>
  );
};
