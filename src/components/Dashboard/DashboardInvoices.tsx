
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceTable } from "./InvoiceTable";
import { useDashboardInvoices } from "@/hooks/use-dashboard-invoices";
import { DateFilter } from "@/types/invoice";

interface DashboardInvoicesProps {
  dateFilter: DateFilter;
  startDate: Date;
}

export const DashboardInvoices = ({ dateFilter, startDate }: DashboardInvoicesProps) => {
  const { data: invoices, isLoading, error } = useDashboardInvoices(dateFilter, startDate);

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
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-6 text-muted-foreground">Chargement des factures...</p>
        ) : error ? (
          <p className="text-destructive">Erreur lors du chargement des factures</p>
        ) : (
          <InvoiceTable invoices={invoices || []} isLoading={isLoading} />
        )}
      </CardContent>
    </Card>
  );
};
