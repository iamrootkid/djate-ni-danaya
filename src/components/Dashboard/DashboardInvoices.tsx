
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceTableSkeleton } from "./InvoiceTableSkeleton";
import { useDashboardInvoices } from "@/hooks/use-dashboard-invoices";

export const DashboardInvoices = () => {
  const { data: invoices, isLoading, error } = useDashboardInvoices();

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
